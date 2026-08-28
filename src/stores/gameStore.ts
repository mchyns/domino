import { create } from 'zustand';
import {
  RoomState,
  DominoTileData,
  PlayerCount,
  LegalMoveInfo,
} from '../engine/types';
import { BroadcastSyncEngine } from '../realtime/broadcastSync';
import { soundFx } from '../engine/audio';
import { usePlayerStore } from './playerStore';
import { getLegalMovesInHand } from '../engine/gameRules';

interface GameStoreState {
  roomState: RoomState | null;
  privateHand: DominoTileData[];
  selectedTileId: string | null;
  toastMessage: string | null;
  syncEngine: BroadcastSyncEngine | null;
  isLoading: boolean;

  connectRoom: (roomCode: string, customNickname?: string) => void;
  disconnectRoom: () => void;
  createRoom: (maxPlayers: PlayerCount) => RoomState;
  joinRoom: (roomCode: string, nickname: string) => void;
  startGame: () => void;
  playTile: (tileId: string, side: 'left' | 'right') => void;
  passTurn: () => void;
  requestRematch: () => void;
  leaveRoom: () => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  fillBots: () => void;
  selectTile: (tileId: string | null) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  getLegalMoves: () => Record<string, LegalMoveInfo>;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  roomState: null,
  privateHand: [],
  selectedTileId: null,
  toastMessage: null,
  syncEngine: null,
  isLoading: false,

  connectRoom: (roomCode: string, customNickname?: string) => {
    const { userId, nickname } = usePlayerStore.getState();
    const effectiveNick = customNickname || nickname || 'Pemain';
    const existingEngine = get().syncEngine;
    if (existingEngine) {
      existingEngine.disconnect();
    }

    const engine = new BroadcastSyncEngine(userId, effectiveNick);

    engine.onStateChange((newState, newHand) => {
      const prevMatch = get().roomState?.match;
      const currentMatch = newState?.match;

      // Sound alerts
      if (currentMatch && prevMatch) {
        // Tile played sound
        if (
          currentMatch.board.length > prevMatch.board.length &&
          currentMatch.lastAction?.type === 'play'
        ) {
          soundFx.playTileClick();
        }
        // Pass sound
        if (
          currentMatch.consecutivePasses > prevMatch.consecutivePasses &&
          currentMatch.lastAction?.type === 'pass'
        ) {
          soundFx.playPassSound();
        }
        // Turn changed to me
        if (
          currentMatch.currentPlayerId === userId &&
          prevMatch.currentPlayerId !== userId
        ) {
          soundFx.playTurnChime();
        }
        // Game win sound
        if (
          currentMatch.status === 'finished' &&
          prevMatch.status !== 'finished'
        ) {
          soundFx.playWinChime();
        }
      } else if (currentMatch && !prevMatch) {
        // Game started sound
        soundFx.playDealSound();
        if (currentMatch.currentPlayerId === userId) {
          setTimeout(() => soundFx.playTurnChime(), 600);
        }
      }

      set({
        roomState: newState,
        privateHand: newHand,
      });
    });

    engine.onError((errMsg) => {
      get().showToast(errMsg);
    });

    engine.connect(roomCode);
    set({ syncEngine: engine });
  },

  disconnectRoom: () => {
    const engine = get().syncEngine;
    if (engine) {
      engine.disconnect();
    }
    set({
      syncEngine: null,
      roomState: null,
      privateHand: [],
      selectedTileId: null,
    });
  },

  createRoom: (maxPlayers: PlayerCount) => {
    const engine = get().syncEngine;
    if (!engine) throw new Error('Sync engine not connected');
    const state = engine.createRoom(maxPlayers);
    set({ roomState: state });
    return state;
  },

  joinRoom: (roomCode: string, nickname: string) => {
    get().connectRoom(roomCode);
    const engine = get().syncEngine;
    if (engine) {
      engine.joinRoom(nickname);
    }
  },

  startGame: () => {
    const engine = get().syncEngine;
    if (engine) {
      engine.startGame();
    }
  },

  playTile: (tileId: string, side: 'left' | 'right') => {
    const engine = get().syncEngine;
    if (engine) {
      engine.playTile(tileId, side);
      set({ selectedTileId: null });
    }
  },

  passTurn: () => {
    const engine = get().syncEngine;
    if (engine) {
      engine.passTurn();
      set({ selectedTileId: null });
    }
  },

  requestRematch: () => {
    const engine = get().syncEngine;
    if (engine) {
      engine.requestRematch();
      set({ selectedTileId: null });
    }
  },

  leaveRoom: () => {
    const engine = get().syncEngine;
    if (engine) {
      engine.leaveRoom();
    }
    get().disconnectRoom();
  },

  addBot: () => {
    const engine = get().syncEngine;
    if (engine) {
      engine.addBotPlayer();
    }
  },

  removeBot: (botId: string) => {
    const engine = get().syncEngine;
    if (engine) {
      engine.removeBotPlayer(botId);
    }
  },

  fillBots: () => {
    const engine = get().syncEngine;
    if (engine) {
      engine.fillBots();
    }
  },

  selectTile: (tileId: string | null) => {
    set({ selectedTileId: tileId });
  },

  showToast: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 3200);
  },

  clearToast: () => {
    set({ toastMessage: null });
  },

  getLegalMoves: () => {
    const { roomState, privateHand } = get();
    if (!roomState?.match) return {};
    return getLegalMovesInHand(
      privateHand,
      roomState.match.leftValue,
      roomState.match.rightValue
    );
  },
}));
