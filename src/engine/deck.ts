import { DominoTileData, PlayerCount } from './types';

/**
 * Generate a complete Double-Six Domino set (28 tiles, 0-0 to 6-6)
 */
export function generateDeck(): DominoTileData[] {
  const deck: DominoTileData[] = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      deck.push({
        id: `tile_${a}_${b}`,
        a,
        b,
      });
    }
  }
  return deck;
}

/**
 * Cryptographically secure Fisher-Yates shuffle
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    let j = 0;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randArr = new Uint32Array(1);
      crypto.getRandomValues(randArr);
      j = randArr[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export interface DealResult {
  hands: Record<string, DominoTileData[]>;
  starterTile?: DominoTileData;
  firstPlayerId: string;
}

/**
 * Deal tiles to players according to player count:
 * - 2 players: 14 cards each (28 cards total), 0 starter
 * - 3 players: 9 cards each (27 cards total), 1 starter card placed on board
 * - 4 players: 7 cards each (28 cards total), 0 starter
 */
export function dealTiles(playerIds: string[], maxPlayers: PlayerCount): DealResult {
  if (playerIds.length !== maxPlayers) {
    throw new Error(`Expected ${maxPlayers} players, got ${playerIds.length}`);
  }

  const deck = shuffleDeck(generateDeck());
  const hands: Record<string, DominoTileData[]> = {};
  playerIds.forEach((id) => {
    hands[id] = [];
  });

  let starterTile: DominoTileData | undefined = undefined;

  if (maxPlayers === 2) {
    // 14 tiles each
    hands[playerIds[0]] = deck.slice(0, 14);
    hands[playerIds[1]] = deck.slice(14, 28);
  } else if (maxPlayers === 3) {
    // 9 tiles each (27 tiles) + 1 starter tile
    hands[playerIds[0]] = deck.slice(0, 9);
    hands[playerIds[1]] = deck.slice(9, 18);
    hands[playerIds[2]] = deck.slice(18, 27);
    starterTile = deck[27];
  } else if (maxPlayers === 4) {
    // 7 tiles each (28 tiles)
    hands[playerIds[0]] = deck.slice(0, 7);
    hands[playerIds[1]] = deck.slice(7, 14);
    hands[playerIds[2]] = deck.slice(14, 21);
    hands[playerIds[3]] = deck.slice(21, 28);
  }

  // Random first player
  const randomIndex = Math.floor(Math.random() * playerIds.length);
  const firstPlayerId = playerIds[randomIndex];

  return {
    hands,
    starterTile,
    firstPlayerId,
  };
}
