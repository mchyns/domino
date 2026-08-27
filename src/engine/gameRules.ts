import {
  DominoTileData,
  BoardTile,
  LegalMoveInfo,
  PlayerScore,
  PlayerPublicInfo,
} from './types';

/**
 * Check if a specific tile can be played on left or right end of the board
 */
export function checkTileLegality(
  tile: DominoTileData,
  leftValue: number | null,
  rightValue: number | null
): LegalMoveInfo {
  // If board is empty, any tile can be played
  if (leftValue === null || rightValue === null) {
    return {
      tileId: tile.id,
      canPlayLeft: true,
      canPlayRight: true,
    };
  }

  const canPlayLeft = tile.a === leftValue || tile.b === leftValue;
  const canPlayRight = tile.a === rightValue || tile.b === rightValue;

  return {
    tileId: tile.id,
    canPlayLeft,
    canPlayRight,
  };
}

/**
 * Get legal move status for all tiles in hand
 */
export function getLegalMovesInHand(
  hand: DominoTileData[],
  leftValue: number | null,
  rightValue: number | null
): Record<string, LegalMoveInfo> {
  const result: Record<string, LegalMoveInfo> = {};
  for (const tile of hand) {
    result[tile.id] = checkTileLegality(tile, leftValue, rightValue);
  }
  return result;
}

/**
 * Determine if current player has at least one legal move
 */
export function hasAnyLegalMove(
  hand: DominoTileData[],
  leftValue: number | null,
  rightValue: number | null
): boolean {
  const moves = getLegalMovesInHand(hand, leftValue, rightValue);
  return Object.values(moves).some((m) => m.canPlayLeft || m.canPlayRight);
}

export interface PlaceTileResult {
  board: BoardTile[];
  leftValue: number;
  rightValue: number;
  playedTile: BoardTile;
}

/**
 * Place a tile on the board (handles rotation and updating left/right values)
 */
export function placeTileOnBoard(
  board: BoardTile[],
  currentLeft: number | null,
  currentRight: number | null,
  tile: DominoTileData,
  side: 'left' | 'right',
  playerId: string
): PlaceTileResult {
  const now = Date.now();
  const isDouble = tile.a === tile.b;

  // Case 1: First tile on empty board
  if (board.length === 0 || currentLeft === null || currentRight === null) {
    const starter: BoardTile = {
      id: tile.id,
      a: tile.a,
      b: tile.b,
      displayLeft: tile.a,
      displayRight: tile.b,
      playedBy: playerId,
      playedAt: now,
      position: 'starter',
      isDouble,
    };
    return {
      board: [starter],
      leftValue: tile.a,
      rightValue: tile.b,
      playedTile: starter,
    };
  }

  if (side === 'left') {
    if (tile.a !== currentLeft && tile.b !== currentLeft) {
      throw new Error(`Tile ${tile.a}-${tile.b} cannot connect to left value ${currentLeft}`);
    }

    let displayLeft: number;
    let displayRight: number;

    if (tile.b === currentLeft) {
      // Right side of new tile connects with currentLeft
      displayLeft = tile.a;
      displayRight = tile.b;
    } else {
      // Rotate: Left side of tile connects with currentLeft
      displayLeft = tile.b;
      displayRight = tile.a;
    }

    const newBoardTile: BoardTile = {
      id: tile.id,
      a: tile.a,
      b: tile.b,
      displayLeft,
      displayRight,
      playedBy: playerId,
      playedAt: now,
      position: 'left',
      isDouble,
    };

    return {
      board: [newBoardTile, ...board],
      leftValue: displayLeft,
      rightValue: currentRight,
      playedTile: newBoardTile,
    };
  } else {
    // side === 'right'
    if (tile.a !== currentRight && tile.b !== currentRight) {
      throw new Error(`Tile ${tile.a}-${tile.b} cannot connect to right value ${currentRight}`);
    }

    let displayLeft: number;
    let displayRight: number;

    if (tile.a === currentRight) {
      // Left side of new tile connects with currentRight
      displayLeft = tile.a;
      displayRight = tile.b;
    } else {
      // Rotate: Right side of tile connects with currentRight
      displayLeft = tile.b;
      displayRight = tile.a;
    }

    const newBoardTile: BoardTile = {
      id: tile.id,
      a: tile.a,
      b: tile.b,
      displayLeft,
      displayRight,
      playedBy: playerId,
      playedAt: now,
      position: 'right',
      isDouble,
    };

    return {
      board: [...board, newBoardTile],
      leftValue: currentLeft,
      rightValue: displayRight,
      playedTile: newBoardTile,
    };
  }
}

/**
 * Calculate total pip sum for a hand
 */
export function calculatePipSum(hand: DominoTileData[]): number {
  return hand.reduce((acc, tile) => acc + tile.a + tile.b, 0);
}

/**
 * Evaluate blocked game results:
 * Player with lowest pip sum wins.
 */
export function evaluateBlockedGame(
  players: PlayerPublicInfo[],
  allHands: Record<string, DominoTileData[]>
): { winnerPlayerId: string; scores: PlayerScore[] } {
  const scores: PlayerScore[] = players.map((p) => {
    const hand = allHands[p.id] || [];
    const pipTotal = calculatePipSum(hand);
    return {
      playerId: p.id,
      nickname: p.nickname,
      pipTotal,
      remainingTiles: hand,
    };
  });

  // Sort ascending by pip count (lowest wins)
  scores.sort((a, b) => a.pipTotal - b.pipTotal);

  const winner = scores[0];

  return {
    winnerPlayerId: winner ? winner.playerId : players[0].id,
    scores,
  };
}

/**
 * Get next player ID in turn order
 */
export function getNextPlayerId(playerOrder: string[], currentPlayerId: string): string {
  const currentIndex = playerOrder.indexOf(currentPlayerId);
  if (currentIndex === -1) return playerOrder[0];
  const nextIndex = (currentIndex + 1) % playerOrder.length;
  return playerOrder[nextIndex];
}
