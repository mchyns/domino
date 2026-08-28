import { DominoTileData } from './types';
import { checkTileLegality } from './gameRules';

export interface BotDecision {
  action: 'play' | 'pass';
  tileId?: string;
  side?: 'left' | 'right';
}

interface CandidateMove {
  tile: DominoTileData;
  side: 'left' | 'right';
  score: number;
}

/**
 * Smart Gaple/Domino Bot AI Strategy:
 * 1. Prioritize dumping heavy double/balak tiles (e.g. 6-6, 5-5) early.
 * 2. Prioritize high pip count tiles (e.g. 6-5, 6-4) to minimize point penalties.
 * 3. Favor moves that leave open ends matching other cards remaining in the bot's hand (hand synergy).
 */
export function chooseBotMove(
  hand: DominoTileData[],
  leftValue: number | null,
  rightValue: number | null
): BotDecision {
  if (hand.length === 0) {
    return { action: 'pass' };
  }

  // Initial move when board is empty
  if (leftValue === null && rightValue === null) {
    // Pick the highest double, or highest pip tile
    const sorted = [...hand].sort((a, b) => {
      const aDouble = a.a === a.b ? 50 : 0;
      const bDouble = b.a === b.b ? 50 : 0;
      return (bDouble + b.a + b.b) - (aDouble + a.a + a.b);
    });

    const bestTile = sorted[0];
    return {
      action: 'play',
      tileId: bestTile.id,
      side: 'left',
    };
  }

  const candidates: CandidateMove[] = [];

  hand.forEach((tile) => {
    const legal = checkTileLegality(tile, leftValue, rightValue);
    const isDouble = tile.a === tile.b;
    const pipSum = tile.a + tile.b;

    if (legal.canPlayLeft && leftValue !== null) {
      // Calculate what the new left value would be
      const newOpenEnd = tile.a === leftValue ? tile.b : tile.a;
      // Check synergy: how many other cards in bot hand have newOpenEnd?
      const matchingRemaining = hand.filter(
        (t) => t.id !== tile.id && (t.a === newOpenEnd || t.b === newOpenEnd)
      ).length;

      let score = pipSum * 1.5;
      if (isDouble) score += 20; // Dump doubles
      score += matchingRemaining * 8; // Synergy

      candidates.push({ tile, side: 'left', score });
    }

    if (legal.canPlayRight && rightValue !== null) {
      // Calculate what the new right value would be
      const newOpenEnd = tile.a === rightValue ? tile.b : tile.a;
      const matchingRemaining = hand.filter(
        (t) => t.id !== tile.id && (t.a === newOpenEnd || t.b === newOpenEnd)
      ).length;

      let score = pipSum * 1.5;
      if (isDouble) score += 20;
      score += matchingRemaining * 8;

      candidates.push({ tile, side: 'right', score });
    }
  });

  if (candidates.length === 0) {
    return { action: 'pass' };
  }

  // Sort candidates by highest strategic score
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return {
    action: 'play',
    tileId: best.tile.id,
    side: best.side,
  };
}

const BOT_NAMES = [
  'Bot Budi',
  'Bot Slamet',
  'Bot Joko',
  'Bot Agus',
  'Bot Tejo',
  'Bot Bambang',
  'Bot Rian',
  'Bot Wayan',
];

/**
 * Generate a unique bot player info
 */
export function createBotPlayer(seatNumber: number, existingNames: string[] = []) {
  const availableNames = BOT_NAMES.filter((name) => !existingNames.includes(name));
  const chosenName =
    availableNames.length > 0
      ? availableNames[Math.floor(Math.random() * availableNames.length)]
      : `Bot ${Math.floor(Math.random() * 900 + 100)}`;

  const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: botId,
    nickname: chosenName,
    seatNumber,
    isHost: false,
    isConnected: true,
    tileCount: 0,
    lastSeen: Date.now(),
    isBot: true,
  };
}
