import { describe, it, expect } from 'vitest';
import { generateDeck, shuffleDeck, dealTiles } from '../src/engine/deck';

describe('Deck & Deal Engine', () => {
  it('should generate all 28 unique double-six domino tiles', () => {
    const deck = generateDeck();
    expect(deck).toHaveLength(28);

    const ids = new Set(deck.map((t) => t.id));
    expect(ids.size).toBe(28);

    // Verify 0-0 to 6-6
    expect(deck.some((t) => t.a === 0 && t.b === 0)).toBe(true);
    expect(deck.some((t) => t.a === 6 && t.b === 6)).toBe(true);
  });

  it('should shuffle tiles without losing or duplicating tiles', () => {
    const deck = generateDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(28);
    const ids = new Set(shuffled.map((t) => t.id));
    expect(ids.size).toBe(28);
  });

  it('should correctly deal cards for 2 players (14 each, 0 starter)', () => {
    const playerIds = ['p1', 'p2'];
    const result = dealTiles(playerIds, 2);

    expect(result.hands['p1']).toHaveLength(14);
    expect(result.hands['p2']).toHaveLength(14);
    expect(result.starterTile).toBeUndefined();
    expect(playerIds).toContain(result.firstPlayerId);
  });

  it('should correctly deal cards for 3 players (9 each, 1 starter on board)', () => {
    const playerIds = ['p1', 'p2', 'p3'];
    const result = dealTiles(playerIds, 3);

    expect(result.hands['p1']).toHaveLength(9);
    expect(result.hands['p2']).toHaveLength(9);
    expect(result.hands['p3']).toHaveLength(9);
    expect(result.starterTile).toBeDefined();

    // Total tiles = 27 + 1 = 28
    const totalHandTiles = [
      ...result.hands['p1'],
      ...result.hands['p2'],
      ...result.hands['p3'],
      result.starterTile!,
    ];
    expect(new Set(totalHandTiles.map((t) => t.id)).size).toBe(28);
    expect(playerIds).toContain(result.firstPlayerId);
  });

  it('should correctly deal cards for 4 players (7 each, 0 starter)', () => {
    const playerIds = ['p1', 'p2', 'p3', 'p4'];
    const result = dealTiles(playerIds, 4);

    expect(result.hands['p1']).toHaveLength(7);
    expect(result.hands['p2']).toHaveLength(7);
    expect(result.hands['p3']).toHaveLength(7);
    expect(result.hands['p4']).toHaveLength(7);
    expect(result.starterTile).toBeUndefined();
    expect(playerIds).toContain(result.firstPlayerId);
  });
});
