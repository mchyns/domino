export type PlayerCount = 2 | 3 | 4;

export interface DominoTileData {
  id: string; // e.g. "tile_2_5"
  a: number;  // 0 to 6
  b: number;  // 0 to 6 (a <= b in base hand)
}

export interface BoardTile {
  id: string;
  a: number;
  b: number;
  displayLeft: number;
  displayRight: number;
  playedBy: string; // player id
  playedAt: number; // timestamp
  position: 'starter' | 'left' | 'right';
  isDouble: boolean;
}

export interface PlayerPublicInfo {
  id: string;
  nickname: string;
  seatNumber: number;
  isHost: boolean;
  isConnected: boolean;
  tileCount: number;
  lastSeen: number;
}

export type RoomStatus = 'lobby' | 'playing' | 'finished' | 'closed';
export type MatchStatus = 'waiting' | 'playing' | 'finished';
export type WinReason = 'domino' | 'blocked';

export interface PlayerScore {
  playerId: string;
  nickname: string;
  pipTotal: number;
  remainingTiles: DominoTileData[];
}

export interface MatchState {
  id: string;
  roomCode: string;
  status: MatchStatus;
  currentPlayerId: string;
  playerOrder: string[]; // array of player ids in turn order
  starterTile?: DominoTileData;
  board: BoardTile[];
  leftValue: number | null;
  rightValue: number | null;
  consecutivePasses: number;
  winnerPlayerId: string | null;
  winReason: WinReason | null;
  scores?: PlayerScore[];
  lastAction?: {
    type: 'play' | 'pass' | 'start' | 'rematch';
    playerId: string;
    nickname: string;
    tile?: DominoTileData;
    position?: 'left' | 'right';
    timestamp: number;
  };
  startedAt: number;
  finishedAt?: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  maxPlayers: PlayerCount;
  status: RoomStatus;
  players: PlayerPublicInfo[];
  createdAt: number;
  updatedAt: number;
  match?: MatchState;
}

export interface LegalMoveInfo {
  tileId: string;
  canPlayLeft: boolean;
  canPlayRight: boolean;
}

export interface PlayMoveIntent {
  action: 'PLAY_TILE';
  tileId: string;
  side: 'left' | 'right';
}

export interface PassTurnIntent {
  action: 'PASS_TURN';
}
