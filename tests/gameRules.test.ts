import { describe, it, expect } from 'vitest';
import {
  checkTileLegality,
  placeTileOnBoard,
  hasAnyLegalMove,
  calculatePipSum,
  evaluateBlockedGame,
  getNextPlayerId,
} from '../src/engine/gameRules';
import { DominoTileData, BoardTile } from '../src/engine/types';

describe('Game Rules Engine', () => {
  it('should allow any move on an empty board', () => {
    const tile: DominoTileData = { id: 'tile_3_5', a: 3, b: 5 };
    const legality = checkTileLegality(tile, null, null);
    expect(legality.canPlayLeft).toBe(true);
    expect(legality.canPlayRight).toBe(true);
  });

  it('should validate legal moves on matching open endpoints', () => {
    // Board has leftValue = 6, rightValue = 1
    const leftVal = 6;
    const rightVal = 1;

    // Tile 1-3 can play on right (1)
    const tile13: DominoTileData = { id: 'tile_1_3', a: 1, b: 3 };
    const leg13 = checkTileLegality(tile13, leftVal, rightVal);
    expect(leg13.canPlayLeft).toBe(false);
    expect(leg13.canPlayRight).toBe(true);

    // Tile 5-6 can play on left (6)
    const tile56: DominoTileData = { id: 'tile_5_6', a: 5, b: 6 };
    const leg56 = checkTileLegality(tile56, leftVal, rightVal);
    expect(leg56.canPlayLeft).toBe(true);
    expect(leg56.canPlayRight).toBe(false);

    // Tile 1-6 can play on BOTH ends
    const tile16: DominoTileData = { id: 'tile_1_6', a: 1, b: 6 };
    const leg16 = checkTileLegality(tile16, leftVal, rightVal);
    expect(leg16.canPlayLeft).toBe(true);
    expect(leg16.canPlayRight).toBe(true);

    // Tile 2-4 cannot play on either
    const tile24: DominoTileData = { id: 'tile_2_4', a: 2, b: 4 };
    const leg24 = checkTileLegality(tile24, leftVal, rightVal);
    expect(leg24.canPlayLeft).toBe(false);
    expect(leg24.canPlayRight).toBe(false);
  });

  it('should correctly place tile on empty board and set endpoints', () => {
    const tile: DominoTileData = { id: 'tile_2_4', a: 2, b: 4 };
    const result = placeTileOnBoard([], null, null, tile, 'left', 'p1');

    expect(result.board).toHaveLength(1);
    expect(result.leftValue).toBe(2);
    expect(result.rightValue).toBe(4);
    expect(result.board[0].displayLeft).toBe(2);
    expect(result.board[0].displayRight).toBe(4);
  });

  it('should correctly place tile on left and update left endpoint', () => {
    // Current board: [2-4], endpoints left=2, right=4
    const initialBoard: BoardTile[] = [
      {
        id: 'tile_2_4',
        a: 2,
        b: 4,
        displayLeft: 2,
        displayRight: 4,
        playedBy: 'p1',
        playedAt: Date.now(),
        position: 'starter',
        isDouble: false,
      },
    ];

    // Play tile 6-2 on the left (so 2 connects with 2, leaving 6 on the new outer left)
    const tile62: DominoTileData = { id: 'tile_2_6', a: 2, b: 6 };
    const result = placeTileOnBoard(initialBoard, 2, 4, tile62, 'left', 'p2');

    expect(result.board).toHaveLength(2);
    expect(result.leftValue).toBe(6);
    expect(result.rightValue).toBe(4);
    expect(result.board[0].displayLeft).toBe(6);
    expect(result.board[0].displayRight).toBe(2);
  });

  it('should correctly place tile on right and update right endpoint', () => {
    // Current board: [2-4], endpoints left=2, right=4
    const initialBoard: BoardTile[] = [
      {
        id: 'tile_2_4',
        a: 2,
        b: 4,
        displayLeft: 2,
        displayRight: 4,
        playedBy: 'p1',
        playedAt: Date.now(),
        position: 'starter',
        isDouble: false,
      },
    ];

    // Play tile 4-1 on the right (so 4 connects with 4, leaving 1 on the new outer right)
    const tile41: DominoTileData = { id: 'tile_1_4', a: 1, b: 4 };
    const result = placeTileOnBoard(initialBoard, 2, 4, tile41, 'right', 'p2');

    expect(result.board).toHaveLength(2);
    expect(result.leftValue).toBe(2);
    expect(result.rightValue).toBe(1);
    expect(result.board[1].displayLeft).toBe(4);
    expect(result.board[1].displayRight).toBe(1);
  });

  it('should detect when player has no legal moves and must pass', () => {
    const hand: DominoTileData[] = [
      { id: 'tile_0_0', a: 0, b: 0 },
      { id: 'tile_3_3', a: 3, b: 3 },
    ];
    // endpoints 5 and 6
    expect(hasAnyLegalMove(hand, 5, 6)).toBe(false);

    // endpoints 3 and 5
    expect(hasAnyLegalMove(hand, 3, 5)).toBe(true);
  });

  it('should correctly evaluate blocked game by lowest pip count', () => {
    const players = [
      { id: 'p1', nickname: 'Raka', seatNumber: 0, isHost: true, isConnected: true, tileCount: 2, lastSeen: 0 },
      { id: 'p2', nickname: 'Dimas', seatNumber: 1, isHost: false, isConnected: true, tileCount: 2, lastSeen: 0 },
      { id: 'p3', nickname: 'Budi', seatNumber: 2, isHost: false, isConnected: true, tileCount: 2, lastSeen: 0 },
    ];

    const allHands: Record<string, DominoTileData[]> = {
      p1: [{ id: 't1', a: 6, b: 6 }], // sum = 12
      p2: [{ id: 't2', a: 5, b: 5 }, { id: 't3', a: 4, b: 4 }], // sum = 18
      p3: [{ id: 't4', a: 3, b: 6 }], // sum = 9 (Lowest -> Winner)
    };

    const evalResult = evaluateBlockedGame(players, allHands);
    expect(evalResult.winnerPlayerId).toBe('p3');
    expect(evalResult.scores[0].nickname).toBe('Budi');
    expect(evalResult.scores[0].pipTotal).toBe(9);
  });

  it('should cycle turn order cleanly', () => {
    const playerOrder = ['p1', 'p2', 'p3', 'p4'];
    expect(getNextPlayerId(playerOrder, 'p1')).toBe('p2');
    expect(getNextPlayerId(playerOrder, 'p2')).toBe('p3');
    expect(getNextPlayerId(playerOrder, 'p3')).toBe('p4');
    expect(getNextPlayerId(playerOrder, 'p4')).toBe('p1');
  });
});
