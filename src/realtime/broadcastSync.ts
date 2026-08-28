import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  RoomState,
  MatchState,
  DominoTileData,
  PlayerCount,
  PlayerPublicInfo,
  LegalMoveInfo,
} from '../engine/types';
import { dealTiles } from '../engine/deck';
import {
  placeTileOnBoard,
  hasAnyLegalMove,
  evaluateBlockedGame,
  getNextPlayerId,
  getLegalMovesInHand,
} from '../engine/gameRules';
import { createBotPlayer, chooseBotMove } from '../engine/botAI';

export interface SyncMessage {
  type:
    | 'STATE_UPDATE'
    | 'PRIVATE_HAND_UPDATE'
    | 'PLAYER_ACTION_INTENT'
    | 'REQUEST_FULL_STATE'
    | 'PING'
    | 'PONG';
  roomCode: string;
  senderId: string;
  payload?: any;
}

export type StateListener = (state: RoomState, privateHand: DominoTileData[]) => void;
export type ErrorListener = (errorMsg: string) => void;

/**
 * Universal Hybrid Realtime Sync Engine
 * Combines Supabase Database + Postgres Changes + Realtime WebSockets Broadcast + BroadcastChannel
 */
export class BroadcastSyncEngine {
  private channel: BroadcastChannel | null = null;
  private supabase: SupabaseClient | null = null;
  private supabaseChannel: RealtimeChannel | null = null;
  private roomCode: string = '';
  private currentUserId: string = '';
  private currentNickname: string = '';
  private stateListeners: Set<StateListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  // Local client cache
  private localRoomState: RoomState | null = null;
  private localPrivateHand: DominoTileData[] = [];

  // Authoritative host memory (stored only in host's instance/storage)
  private allHandsAuth: Record<string, DominoTileData[]> = {};
  private botActionTimeout: any = null;
  private afkTimeout: any = null;

  constructor(userId: string, nickname: string) {
    this.currentUserId = userId;
    this.currentNickname = nickname;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
      } catch (err) {
        console.warn('Supabase client init error:', err);
      }
    }
  }

  public connect(roomCode: string): void {
    if (this.channel) {
      this.channel.close();
    }
    if (this.supabase && this.supabaseChannel) {
      this.supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
    }

    this.roomCode = roomCode.toUpperCase();
    this.channel = new BroadcastChannel(`domino_room_${this.roomCode}`);

    this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      this.handleIncomingMessage(event.data);
    };

    // Load initial cached state from localStorage if available
    const savedStateStr =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(`domino_room_state_${this.roomCode}`)
        : null;

    if (savedStateStr) {
      try {
        this.localRoomState = JSON.parse(savedStateStr);
      } catch {}
    }

    const savedHandStr =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(`domino_hand_${this.roomCode}_${this.currentUserId}`)
        : null;

    if (savedHandStr) {
      try {
        this.localPrivateHand = JSON.parse(savedHandStr);
      } catch {}
    }

    // Connect to Supabase Realtime WebSockets & Database changes
    if (this.supabase) {
      this.supabaseChannel = this.supabase.channel(`domino_${this.roomCode}`, {
        config: {
          broadcast: { self: false },
        },
      });

      this.supabaseChannel
        .on('broadcast', { event: 'domino_sync' }, ({ payload }) => {
          this.handleIncomingMessage(payload as SyncMessage);
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rooms',
            filter: `code=eq.${this.roomCode}`,
          },
          (payload) => {
            if (payload.new) {
              const row = payload.new as any;
              const cloudState: RoomState = {
                code: row.code,
                hostId: row.host_id,
                maxPlayers: row.max_players,
                status: row.status,
                players: row.players || [],
                createdAt: new Date(row.created_at).getTime(),
                updatedAt: new Date(row.updated_at).getTime(),
                match: row.match_state || undefined,
              };
              this.localRoomState = cloudState;
              this.notifyState();
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.broadcast({
              type: 'REQUEST_FULL_STATE',
              roomCode: this.roomCode,
              senderId: this.currentUserId,
              payload: { nickname: this.currentNickname },
            });
          }
        });

      // Instantly query cloud database
      this.fetchCloudRoomState();
    }

    // Request state from local peers
    this.broadcast({
      type: 'REQUEST_FULL_STATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { nickname: this.currentNickname },
    });

    this.notifyState();
  }

  public async fetchCloudRoomState(): Promise<RoomState | null> {
    if (!this.supabase) return null;
    try {
      const { data, error } = await this.supabase
        .from('rooms')
        .select('*')
        .eq('code', this.roomCode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching room from Supabase:', error);
        return null;
      }

      if (data) {
        const cloudState: RoomState = {
          code: data.code,
          hostId: data.host_id,
          maxPlayers: data.max_players,
          status: data.status,
          players: data.players || [],
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.updated_at).getTime(),
          match: data.match_state || undefined,
        };

        if (
          !this.localRoomState ||
          cloudState.updatedAt >= this.localRoomState.updatedAt
        ) {
          this.localRoomState = cloudState;
          this.saveStateToStorage(cloudState);
          this.notifyState();
        }
        return cloudState;
      }
    } catch (err) {
      console.error('fetchCloudRoomState failed:', err);
    }
    return null;
  }

  public disconnect(): void {
    if (this.botActionTimeout) clearTimeout(this.botActionTimeout);
    if (this.afkTimeout) clearTimeout(this.afkTimeout);

    if (this.channel) {
      this.leaveRoom();
      this.channel.close();
      this.channel = null;
    }
    if (this.supabase && this.supabaseChannel) {
      this.supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
    }
    this.stateListeners.clear();
    this.errorListeners.clear();
  }

  public onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    if (this.localRoomState) {
      listener(this.localRoomState, this.localPrivateHand);
    }
    return () => this.stateListeners.delete(listener);
  }

  public onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private notifyState(): void {
    if (!this.localRoomState) return;
    this.stateListeners.forEach((fn) =>
      fn(this.localRoomState!, this.localPrivateHand)
    );
    this.checkTurnAutomation();
  }

  private notifyError(msg: string): void {
    this.errorListeners.forEach((fn) => fn(msg));
  }

  private broadcast(msg: SyncMessage): void {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
    if (this.supabaseChannel) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'domino_sync',
        payload: msg,
      });
    }
  }

  private isHost(): boolean {
    return !!this.localRoomState && this.localRoomState.hostId === this.currentUserId;
  }

  /**
   * CREATE ROOM
   */
  public createRoom(maxPlayers: PlayerCount): RoomState {
    const now = Date.now();
    const newPlayer: PlayerPublicInfo = {
      id: this.currentUserId,
      nickname: this.currentNickname,
      seatNumber: 0,
      isHost: true,
      isConnected: true,
      tileCount: 0,
      lastSeen: now,
    };

    const newState: RoomState = {
      code: this.roomCode,
      hostId: this.currentUserId,
      maxPlayers,
      status: 'lobby',
      players: [newPlayer],
      createdAt: now,
      updatedAt: now,
    };

    this.localRoomState = newState;
    this.localPrivateHand = [];
    this.saveStateToStorage(newState);

    this.broadcast({
      type: 'STATE_UPDATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { roomState: newState },
    });

    this.notifyState();
    return newState;
  }

  /**
   * JOIN ROOM (Direct Database Join + WebSocket Broadcast)
   */
  public async joinRoom(nickname: string): Promise<void> {
    this.currentNickname = nickname;

    // 1. Direct Supabase Cloud Join
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('rooms')
          .select('*')
          .eq('code', this.roomCode)
          .maybeSingle();

        if (error) {
          console.error('Supabase query error on join:', error);
        } else if (!data) {
          this.notifyError(`Room "${this.roomCode}" tidak ditemukan.`);
        } else {
          const players: PlayerPublicInfo[] = data.players || [];
          const existingPlayer = players.find((p) => p.id === this.currentUserId);

          if (!existingPlayer) {
            if (data.status !== 'lobby') {
              this.notifyError('Permainan di room ini sudah dimulai.');
              return;
            }
            if (players.length >= data.max_players) {
              this.notifyError('Room sudah penuh.');
              return;
            }

            const newPlayer: PlayerPublicInfo = {
              id: this.currentUserId,
              nickname,
              seatNumber: players.length,
              isHost: false,
              isConnected: true,
              tileCount: 0,
              lastSeen: Date.now(),
            };

            const updatedPlayers = [...players, newPlayer];
            const updatedState: RoomState = {
              code: data.code,
              hostId: data.host_id,
              maxPlayers: data.max_players,
              status: data.status,
              players: updatedPlayers,
              createdAt: new Date(data.created_at).getTime(),
              updatedAt: Date.now(),
              match: data.match_state || undefined,
            };

            this.localRoomState = updatedState;
            this.saveStateToStorage(updatedState);
            this.broadcast({
              type: 'STATE_UPDATE',
              roomCode: this.roomCode,
              senderId: this.currentUserId,
              payload: { roomState: updatedState },
            });
            this.notifyState();
            return;
          } else {
            // Reconnect existing player
            const updatedState: RoomState = {
              code: data.code,
              hostId: data.host_id,
              maxPlayers: data.max_players,
              status: data.status,
              players,
              createdAt: new Date(data.created_at).getTime(),
              updatedAt: new Date(data.updated_at).getTime(),
              match: data.match_state || undefined,
            };
            this.localRoomState = updatedState;
            this.notifyState();
          }
        }
      } catch (err) {
        console.error('joinRoom Supabase exception:', err);
      }
    }

    // 2. Broadcast join intent to active peers/host
    this.broadcast({
      type: 'REQUEST_FULL_STATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { nickname, intent: 'join' },
    });
  }

  /**
   * START GAME (Host only)
   */
  public startGame(): void {
    if (!this.localRoomState) return;
    if (!this.isHost()) {
      this.notifyError('Hanya host yang dapat memulai permainan.');
      return;
    }
    if (this.localRoomState.players.length !== this.localRoomState.maxPlayers) {
      this.notifyError(
        `Membutuhkan ${this.localRoomState.maxPlayers} pemain untuk memulai.`
      );
      return;
    }

    const playerIds = this.localRoomState.players.map((p) => p.id);
    const deal = dealTiles(playerIds, this.localRoomState.maxPlayers);

    // Compute player turn order:
    // On rematch: 1st turn = Winner of previous game, 2nd turn = 2nd lowest points, 3rd = 3rd lowest, etc.
    let orderedPlayerIds = [...playerIds];
    let firstPlayerId = deal.firstPlayerId;

    const prevMatch = this.localRoomState.match;
    if (
      prevMatch &&
      prevMatch.status === 'finished' &&
      prevMatch.scores &&
      prevMatch.scores.length > 0
    ) {
      const sortedByRank = prevMatch.scores
        .map((s) => s.playerId)
        .filter((id) => playerIds.includes(id));

      playerIds.forEach((id) => {
        if (!sortedByRank.includes(id)) sortedByRank.push(id);
      });

      orderedPlayerIds = sortedByRank;
      firstPlayerId = orderedPlayerIds[0]; // Winner plays first!
    }

    this.allHandsAuth = deal.hands;
    const now = Date.now();

    // Starter board state
    const board = deal.starterTile
      ? [
          {
            id: deal.starterTile.id,
            a: deal.starterTile.a,
            b: deal.starterTile.b,
            displayLeft: deal.starterTile.a,
            displayRight: deal.starterTile.b,
            playedBy: 'system',
            playedAt: now,
            position: 'starter' as const,
            isDouble: deal.starterTile.a === deal.starterTile.b,
          },
        ]
      : [];

    const updatedPlayers = this.localRoomState.players.map((p) => ({
      ...p,
      tileCount: deal.hands[p.id]?.length || 0,
    }));

    const matchState: MatchState = {
      id: `match_${now}`,
      roomCode: this.roomCode,
      status: 'playing',
      currentPlayerId: firstPlayerId,
      playerOrder: orderedPlayerIds,
      starterTile: deal.starterTile,
      board,
      leftValue: deal.starterTile ? deal.starterTile.a : null,
      rightValue: deal.starterTile ? deal.starterTile.b : null,
      consecutivePasses: 0,
      winnerPlayerId: null,
      winReason: null,
      startedAt: now,
      turnDuration: 15000,
      turnDeadline: now + 15000,
      lastAction: {
        type: 'start',
        playerId: this.currentUserId,
        nickname: this.currentNickname,
        timestamp: now,
      },
    };

    const newRoomState: RoomState = {
      ...this.localRoomState,
      status: 'playing',
      players: updatedPlayers,
      updatedAt: now,
      match: matchState,
    };

    this.localRoomState = newRoomState;
    this.localPrivateHand = deal.hands[this.currentUserId] || [];
    this.saveStateToStorage(newRoomState);
    this.saveHandToStorage(this.currentUserId, this.localPrivateHand);

    // Broadcast public state
    this.broadcast({
      type: 'STATE_UPDATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { roomState: newRoomState },
    });

    // Send private hands securely to each player
    playerIds.forEach((pid) => {
      if (pid !== this.currentUserId) {
        this.broadcast({
          type: 'PRIVATE_HAND_UPDATE',
          roomCode: this.roomCode,
          senderId: this.currentUserId,
          payload: { targetPlayerId: pid, hand: deal.hands[pid] },
        });
      }
    });

    this.notifyState();
  }

  /**
   * PLAY TILE
   */
  public playTile(tileId: string, side: 'left' | 'right'): void {
    if (!this.localRoomState || !this.localRoomState.match) return;

    if (this.localRoomState.match.currentPlayerId !== this.currentUserId) {
      this.notifyError('Bukan giliran Anda!');
      return;
    }

    if (this.isHost()) {
      this.executePlayTileAuth(this.currentUserId, tileId, side);
    } else {
      this.broadcast({
        type: 'PLAYER_ACTION_INTENT',
        roomCode: this.roomCode,
        senderId: this.currentUserId,
        payload: { action: 'PLAY_TILE', tileId, side },
      });
    }
  }

  /**
   * PASS TURN
   */
  public passTurn(): void {
    if (!this.localRoomState || !this.localRoomState.match) return;

    if (this.localRoomState.match.currentPlayerId !== this.currentUserId) {
      this.notifyError('Bukan giliran Anda!');
      return;
    }

    const hasMove = hasAnyLegalMove(
      this.localPrivateHand,
      this.localRoomState.match.leftValue,
      this.localRoomState.match.rightValue
    );

    if (hasMove) {
      this.notifyError('Anda masih memiliki kartu yang dapat dimainkan.');
      return;
    }

    if (this.isHost()) {
      this.executePassAuth(this.currentUserId);
    } else {
      this.broadcast({
        type: 'PLAYER_ACTION_INTENT',
        roomCode: this.roomCode,
        senderId: this.currentUserId,
        payload: { action: 'PASS_TURN' },
      });
    }
  }

  /**
   * REMATCH
   */
  public requestRematch(): void {
    if (!this.isHost()) {
      this.notifyError('Hanya host yang dapat memulai rematch.');
      return;
    }
    this.startGame();
  }

  /**
   * LEAVE ROOM
   */
  public leaveRoom(): void {
    if (!this.localRoomState) return;

    const remainingPlayers = this.localRoomState.players.filter(
      (p) => p.id !== this.currentUserId
    );

    let nextHostId = this.localRoomState.hostId;
    if (this.localRoomState.hostId === this.currentUserId) {
      if (remainingPlayers.length > 0) {
        remainingPlayers[0].isHost = true;
        nextHostId = remainingPlayers[0].id;
      }
    }

    const updatedState: RoomState = {
      ...this.localRoomState,
      hostId: nextHostId,
      players: remainingPlayers,
      status: remainingPlayers.length === 0 ? 'closed' : this.localRoomState.status,
      updatedAt: Date.now(),
    };

    this.saveStateToStorage(updatedState);

    this.broadcast({
      type: 'STATE_UPDATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { roomState: updatedState },
    });

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(`domino_hand_${this.roomCode}_${this.currentUserId}`);
    }
    this.localRoomState = null;
    this.localPrivateHand = [];
    this.notifyState();
  }

  /**
   * ADD BOT PLAYER (Host only)
   */
  public addBotPlayer(): void {
    if (!this.isHost() || !this.localRoomState) {
      this.notifyError('Hanya host yang dapat menambahkan bot.');
      return;
    }
    if (this.localRoomState.players.length >= this.localRoomState.maxPlayers) {
      this.notifyError('Slot pemain sudah penuh.');
      return;
    }

    const existingNames = this.localRoomState.players.map((p) => p.nickname);
    const botPlayer = createBotPlayer(this.localRoomState.players.length + 1, existingNames);
    const updatedPlayers = [...this.localRoomState.players, botPlayer];

    const updatedRoomState: RoomState = {
      ...this.localRoomState,
      players: updatedPlayers,
      updatedAt: Date.now(),
    };

    this.localRoomState = updatedRoomState;
    this.saveStateToStorage(updatedRoomState);

    this.broadcast({
      type: 'STATE_UPDATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { roomState: updatedRoomState },
    });
    this.notifyState();
  }

  /**
   * REMOVE BOT PLAYER (Host only)
   */
  public removeBotPlayer(botId: string): void {
    if (!this.isHost() || !this.localRoomState) {
      this.notifyError('Hanya host yang dapat menghapus bot.');
      return;
    }

    const updatedPlayers = this.localRoomState.players.filter((p) => p.id !== botId);
    const updatedRoomState: RoomState = {
      ...this.localRoomState,
      players: updatedPlayers,
      updatedAt: Date.now(),
    };

    this.localRoomState = updatedRoomState;
    this.saveStateToStorage(updatedRoomState);

    this.broadcast({
      type: 'STATE_UPDATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { roomState: updatedRoomState },
    });
    this.notifyState();
  }

  /**
   * FILL ALL OPEN SLOTS WITH BOTS (Host only)
   */
  public fillBots(): void {
    if (!this.isHost() || !this.localRoomState) return;

    const currentPlayers = [...this.localRoomState.players];
    while (currentPlayers.length < this.localRoomState.maxPlayers) {
      const existingNames = currentPlayers.map((p) => p.nickname);
      const botPlayer = createBotPlayer(currentPlayers.length + 1, existingNames);
      currentPlayers.push(botPlayer);
    }

    const updatedRoomState: RoomState = {
      ...this.localRoomState,
      players: currentPlayers,
      updatedAt: Date.now(),
    };

    this.localRoomState = updatedRoomState;
    this.saveStateToStorage(updatedRoomState);

    this.broadcast({
      type: 'STATE_UPDATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { roomState: updatedRoomState },
    });
    this.notifyState();
  }

  /**
   * Host authoritative tile play execution
   */
  private executePlayTileAuth(
    playerId: string,
    tileId: string,
    side: 'left' | 'right'
  ): void {
    if (!this.localRoomState || !this.localRoomState.match) return;
    const match = this.localRoomState.match;

    if (match.currentPlayerId !== playerId) return;

    const playerHand = this.allHandsAuth[playerId] || this.localPrivateHand;
    const tileIndex = playerHand.findIndex((t) => t.id === tileId);
    if (tileIndex === -1) {
      this.notifyError('Tile tidak ditemukan di tangan pemain.');
      return;
    }

    const tile = playerHand[tileIndex];

    try {
      const placement = placeTileOnBoard(
        match.board,
        match.leftValue,
        match.rightValue,
        tile,
        side,
        playerId
      );

      const updatedHand = playerHand.filter((t) => t.id !== tileId);
      this.allHandsAuth[playerId] = updatedHand;

      if (playerId === this.currentUserId) {
        this.localPrivateHand = updatedHand;
        this.saveHandToStorage(playerId, updatedHand);
      }

      const now = Date.now();
      const playerNick =
        this.localRoomState.players.find((p) => p.id === playerId)?.nickname || 'Player';

      const isWinner = updatedHand.length === 0;

      let nextPlayerId = getNextPlayerId(match.playerOrder, playerId);
      let matchStatus = match.status;
      let winnerPlayerId: string | null = null;
      let winReason: 'domino' | 'blocked' | null = null;
      let scores = undefined;

      if (isWinner) {
        matchStatus = 'finished';
        winnerPlayerId = playerId;
        winReason = 'domino';

        const blockedEval = evaluateBlockedGame(
          this.localRoomState.players,
          {
            ...this.allHandsAuth,
            [playerId]: [],
          }
        );
        scores = blockedEval.scores;
        const winnerIndex = scores.findIndex((s) => s.playerId === playerId);
        if (winnerIndex > 0) {
          const [w] = scores.splice(winnerIndex, 1);
          scores.unshift(w);
        }
      }

      const updatedPlayers = this.localRoomState.players.map((p) => ({
        ...p,
        tileCount:
          p.id === playerId ? updatedHand.length : this.allHandsAuth[p.id]?.length || p.tileCount,
      }));

      const updatedMatch: MatchState = {
        ...match,
        board: placement.board,
        leftValue: placement.leftValue,
        rightValue: placement.rightValue,
        consecutivePasses: 0,
        currentPlayerId: isWinner ? match.currentPlayerId : nextPlayerId,
        status: matchStatus,
        winnerPlayerId,
        winReason,
        scores,
        finishedAt: isWinner ? now : undefined,
        turnDuration: 15000,
        turnDeadline: isWinner ? undefined : now + 15000,
        lastAction: {
          type: 'play',
          playerId,
          nickname: playerNick,
          tile,
          position: side,
          timestamp: now,
        },
      };

      const updatedRoom: RoomState = {
        ...this.localRoomState,
        status: isWinner ? 'finished' : 'playing',
        players: updatedPlayers,
        updatedAt: now,
        match: updatedMatch,
      };

      this.localRoomState = updatedRoom;
      this.saveStateToStorage(updatedRoom);

      this.broadcast({
        type: 'STATE_UPDATE',
        roomCode: this.roomCode,
        senderId: this.currentUserId,
        payload: { roomState: updatedRoom },
      });

      if (playerId !== this.currentUserId) {
        this.broadcast({
          type: 'PRIVATE_HAND_UPDATE',
          roomCode: this.roomCode,
          senderId: this.currentUserId,
          payload: { targetPlayerId: playerId, hand: updatedHand },
        });
      }

      this.notifyState();
    } catch (err: any) {
      this.notifyError(err.message || 'Langkah tidak valid');
    }
  }

  /**
   * Host authoritative pass execution
   */
  private executePassAuth(playerId: string): void {
    if (!this.localRoomState || !this.localRoomState.match) return;
    const match = this.localRoomState.match;
    if (match.currentPlayerId !== playerId) return;

    const newPasses = match.consecutivePasses + 1;
    const isBlocked = newPasses >= this.localRoomState.players.length;
    const now = Date.now();
    const playerNick =
      this.localRoomState.players.find((p) => p.id === playerId)?.nickname || 'Player';

    let nextPlayerId = getNextPlayerId(match.playerOrder, playerId);
    let matchStatus = match.status;
    let winnerPlayerId: string | null = null;
    let winReason: 'domino' | 'blocked' | null = null;
    let scores = undefined;

    if (isBlocked) {
      matchStatus = 'finished';
      winReason = 'blocked';
      const blockedEval = evaluateBlockedGame(
        this.localRoomState.players,
        this.allHandsAuth
      );
      winnerPlayerId = blockedEval.winnerPlayerId;
      scores = blockedEval.scores;
    }

    const updatedMatch: MatchState = {
      ...match,
      consecutivePasses: newPasses,
      currentPlayerId: isBlocked ? match.currentPlayerId : nextPlayerId,
      status: matchStatus,
      winnerPlayerId,
      winReason,
      scores,
      finishedAt: isBlocked ? now : undefined,
      turnDuration: 15000,
      turnDeadline: isBlocked ? undefined : now + 15000,
      lastAction: {
        type: 'pass',
        playerId,
        nickname: playerNick,
        timestamp: now,
      },
    };

    const updatedRoom: RoomState = {
      ...this.localRoomState,
      status: isBlocked ? 'finished' : 'playing',
      updatedAt: now,
      match: updatedMatch,
    };

    this.localRoomState = updatedRoom;
    this.saveStateToStorage(updatedRoom);

    this.broadcast({
      type: 'STATE_UPDATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { roomState: updatedRoom },
    });

    this.notifyState();
  }

  /**
   * Automatic execution for Bots and AFK Timeouts
   */
  private checkTurnAutomation(): void {
    if (!this.isHost() || !this.localRoomState || !this.localRoomState.match) return;
    const match = this.localRoomState.match;
    if (match.status !== 'playing') {
      if (this.botActionTimeout) clearTimeout(this.botActionTimeout);
      if (this.afkTimeout) clearTimeout(this.afkTimeout);
      return;
    }

    const currentId = match.currentPlayerId;
    const currentPlayer = this.localRoomState.players.find((p) => p.id === currentId);

    // 1. If current player is a BOT:
    if (currentPlayer?.isBot) {
      if (this.botActionTimeout) clearTimeout(this.botActionTimeout);
      this.botActionTimeout = setTimeout(() => {
        this.executeBotTurn(currentId);
      }, 1200 + Math.random() * 600); // 1.2s - 1.8s realistic thinking delay
      return;
    }

    // 2. If current player is HUMAN, monitor turnDeadline (15s AFK auto-action):
    if (this.afkTimeout) clearTimeout(this.afkTimeout);
    const deadline = match.turnDeadline || (Date.now() + 15000);
    const remainingMs = Math.max(200, deadline - Date.now());

    this.afkTimeout = setTimeout(() => {
      this.executeTimeoutAction(currentId);
    }, remainingMs);
  }

  private executeBotTurn(botId: string): void {
    if (!this.isHost() || !this.localRoomState || !this.localRoomState.match) return;
    const match = this.localRoomState.match;
    if (match.status !== 'playing' || match.currentPlayerId !== botId) return;

    const botHand = this.allHandsAuth[botId] || [];
    const decision = chooseBotMove(botHand, match.leftValue, match.rightValue);

    if (decision.action === 'play' && decision.tileId) {
      this.executePlayTileAuth(botId, decision.tileId, decision.side || 'left');
    } else {
      this.executePassAuth(botId);
    }
  }

  private executeTimeoutAction(playerId: string): void {
    if (!this.isHost() || !this.localRoomState || !this.localRoomState.match) return;
    const match = this.localRoomState.match;
    if (match.status !== 'playing' || match.currentPlayerId !== playerId) return;

    const playerHand =
      this.allHandsAuth[playerId] ||
      (playerId === this.currentUserId ? this.localPrivateHand : []);
    const decision = chooseBotMove(playerHand, match.leftValue, match.rightValue);

    if (decision.action === 'play' && decision.tileId) {
      this.executePlayTileAuth(playerId, decision.tileId, decision.side || 'left');
    } else {
      this.executePassAuth(playerId);
    }
  }

  private handleIncomingMessage(msg: SyncMessage): void {
    if (msg.roomCode !== this.roomCode) return;

    switch (msg.type) {
      case 'STATE_UPDATE': {
        if (msg.payload?.roomState) {
          this.localRoomState = msg.payload.roomState;
          this.saveStateToStorage(this.localRoomState!);
          this.notifyState();
        }
        break;
      }

      case 'PRIVATE_HAND_UPDATE': {
        if (msg.payload?.targetPlayerId === this.currentUserId) {
          this.localPrivateHand = msg.payload.hand || [];
          this.saveHandToStorage(this.currentUserId, this.localPrivateHand);
          this.notifyState();
        }
        break;
      }

      case 'REQUEST_FULL_STATE': {
        if (this.isHost() && this.localRoomState) {
          let updatedState = { ...this.localRoomState };
          const senderId = msg.senderId;
          const senderNick = msg.payload?.nickname || 'Player';

          const existingPlayer = updatedState.players.find((p) => p.id === senderId);
          if (!existingPlayer) {
            if (updatedState.status !== 'lobby') return;
            if (updatedState.players.length >= updatedState.maxPlayers) return;

            const newPlayer: PlayerPublicInfo = {
              id: senderId,
              nickname: senderNick,
              seatNumber: updatedState.players.length,
              isHost: false,
              isConnected: true,
              tileCount: 0,
              lastSeen: Date.now(),
            };

            updatedState.players = [...updatedState.players, newPlayer];
            updatedState.updatedAt = Date.now();
            this.localRoomState = updatedState;
            this.saveStateToStorage(updatedState);
          } else {
            existingPlayer.isConnected = true;
            existingPlayer.lastSeen = Date.now();
            this.localRoomState = updatedState;
          }

          this.broadcast({
            type: 'STATE_UPDATE',
            roomCode: this.roomCode,
            senderId: this.currentUserId,
            payload: { roomState: this.localRoomState },
          });

          this.notifyState();

          if (this.localRoomState.status === 'playing' && this.allHandsAuth[senderId]) {
            this.broadcast({
              type: 'PRIVATE_HAND_UPDATE',
              roomCode: this.roomCode,
              senderId: this.currentUserId,
              payload: { targetPlayerId: senderId, hand: this.allHandsAuth[senderId] },
            });
          }
        }
        break;
      }

      case 'PLAYER_ACTION_INTENT': {
        if (this.isHost() && this.localRoomState?.match) {
          const action = msg.payload?.action;
          if (action === 'PLAY_TILE') {
            this.executePlayTileAuth(
              msg.senderId,
              msg.payload.tileId,
              msg.payload.side
            );
          } else if (action === 'PASS_TURN') {
            this.executePassAuth(msg.senderId);
          }
        }
        break;
      }
    }
  }

  private async saveStateToStorage(state: RoomState): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `domino_room_state_${this.roomCode}`,
          JSON.stringify(state)
        );
      }
    } catch {}

    if (this.supabase) {
      try {
        await this.supabase.from('rooms').upsert(
          {
            code: this.roomCode,
            host_id: state.hostId,
            max_players: state.maxPlayers,
            status: state.status,
            players: state.players,
            match_state: state.match || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'code' }
        );
      } catch (err) {
        console.warn('Supabase upsert non-critical warning:', err);
      }
    }
  }

  private saveHandToStorage(userId: string, hand: DominoTileData[]): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(
          `domino_hand_${this.roomCode}_${userId}`,
          JSON.stringify(hand)
        );
      }
    } catch {}
  }

  public getLegalMoves(): Record<string, LegalMoveInfo> {
    if (!this.localRoomState?.match) return {};
    const leftVal = this.localRoomState.match.leftValue;
    const rightVal = this.localRoomState.match.rightValue;
    return getLegalMovesInHand(this.localPrivateHand, leftVal, rightVal);
  }
}
