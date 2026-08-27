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
 * Local / Multi-Tab Broadcast Synchronization Engine
 * Handles realtime rooms across browser tabs/windows with host authority and private hand isolation.
 */
export class BroadcastSyncEngine {
  private channel: BroadcastChannel | null = null;
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

  constructor(userId: string, nickname: string) {
    this.currentUserId = userId;
    this.currentNickname = nickname;
  }

  public connect(roomCode: string): void {
    if (this.channel) {
      this.channel.close();
    }
    this.roomCode = roomCode.toUpperCase();
    this.channel = new BroadcastChannel(`domino_room_${this.roomCode}`);

    this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      this.handleIncomingMessage(event.data);
    };

    // Load initial cached state from localStorage if available
    const savedStateStr = typeof localStorage !== 'undefined'
      ? localStorage.getItem(`domino_room_state_${this.roomCode}`)
      : null;

    if (savedStateStr) {
      try {
        this.localRoomState = JSON.parse(savedStateStr);
      } catch {
        // ignore
      }
    }

    const savedHandStr = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(`domino_hand_${this.roomCode}_${this.currentUserId}`)
      : null;

    if (savedHandStr) {
      try {
        this.localPrivateHand = JSON.parse(savedHandStr);
      } catch {
        // ignore
      }
    }

    // Request fresh state from room host/peers
    this.broadcast({
      type: 'REQUEST_FULL_STATE',
      roomCode: this.roomCode,
      senderId: this.currentUserId,
      payload: { nickname: this.currentNickname },
    });

    this.notifyState();
  }

  public disconnect(): void {
    if (this.channel) {
      this.leaveRoom();
      this.channel.close();
      this.channel = null;
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
  }

  private notifyError(msg: string): void {
    this.errorListeners.forEach((fn) => fn(msg));
  }

  private broadcast(msg: SyncMessage): void {
    if (this.channel) {
      this.channel.postMessage(msg);
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
   * JOIN ROOM
   */
  public joinRoom(nickname: string): void {
    this.currentNickname = nickname;
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
      currentPlayerId: deal.firstPlayerId,
      playerOrder: playerIds,
      starterTile: deal.starterTile,
      board,
      leftValue: deal.starterTile ? deal.starterTile.a : null,
      rightValue: deal.starterTile ? deal.starterTile.b : null,
      consecutivePasses: 0,
      winnerPlayerId: null,
      winReason: null,
      startedAt: now,
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
      // Send intent to host
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

    // Verify player really has no legal moves
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

      // Remove played tile from player's hand
      const updatedHand = playerHand.filter((t) => t.id !== tileId);
      this.allHandsAuth[playerId] = updatedHand;

      if (playerId === this.currentUserId) {
        this.localPrivateHand = updatedHand;
        this.saveHandToStorage(playerId, updatedHand);
      }

      const now = Date.now();
      const playerNick =
        this.localRoomState.players.find((p) => p.id === playerId)?.nickname || 'Player';

      // Check win condition (domino: hand count is 0)
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

        // Calculate scores for final results
        const blockedEval = evaluateBlockedGame(
          this.localRoomState.players,
          this.allHandsAuth
        );
        scores = blockedEval.scores;
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

      // Broadcast public state
      this.broadcast({
        type: 'STATE_UPDATE',
        roomCode: this.roomCode,
        senderId: this.currentUserId,
        payload: { roomState: updatedRoom },
      });

      // Update player's private hand
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

          // Handle player joining
          const existingPlayer = updatedState.players.find((p) => p.id === senderId);
          if (!existingPlayer) {
            if (updatedState.status !== 'lobby') {
              // Game in progress, cannot join
              return;
            }
            if (updatedState.players.length >= updatedState.maxPlayers) {
              // Room full
              return;
            }

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
            // Player reconnecting
            existingPlayer.isConnected = true;
            existingPlayer.lastSeen = Date.now();
            this.localRoomState = updatedState;
          }

          // Broadcast public state to other tabs
          this.broadcast({
            type: 'STATE_UPDATE',
            roomCode: this.roomCode,
            senderId: this.currentUserId,
            payload: { roomState: this.localRoomState },
          });

          // Also immediately notify host tab!
          this.notifyState();

          // If game is playing, resend private hand to reconnected player
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

  private saveStateToStorage(state: RoomState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `domino_room_state_${this.roomCode}`,
          JSON.stringify(state)
        );
      }
    } catch {
      // storage quota
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
    } catch {
      // storage quota
    }
  }

  public getLegalMoves(): Record<string, LegalMoveInfo> {
    if (!this.localRoomState?.match) return {};
    const leftVal = this.localRoomState.match.leftValue;
    const rightVal = this.localRoomState.match.rightValue;
    return getLegalMovesInHand(this.localPrivateHand, leftVal, rightVal);
  }
}
