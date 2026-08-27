const CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate 6-character unambiguous uppercase room code
 */
export function generateRoomCode(): string {
  let result = '';
  const len = CODE_CHARSET.length;
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * len);
    result += CODE_CHARSET[randomIndex];
  }
  return result;
}

/**
 * Format and validate room code input (trim, uppercase, remove non-alphanumeric)
 */
export function cleanRoomCode(input: string): string {
  return input.toUpperCase().trim().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

/**
 * Generate persistent per-tab anonymous user ID using sessionStorage
 * This ensures different tabs on the same machine act as independent players,
 * while refresh (F5) within the same tab preserves the player's identity and reconnection.
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'domino_session_id';
  let sessionId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
  if (!sessionId) {
    sessionId = 'p_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, sessionId);
    }
  }
  return sessionId;
}

/**
 * Retrieve stored nickname (checks sessionStorage first, then localStorage)
 */
export function getStoredNickname(): string {
  if (typeof sessionStorage === 'undefined') return '';
  return (
    sessionStorage.getItem('domino_nickname') ||
    localStorage.getItem('domino_nickname') ||
    ''
  );
}

/**
 * Save nickname for current tab and machine default
 */
export function saveNickname(name: string): void {
  const trimmed = name.trim();
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('domino_nickname', trimmed);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('domino_nickname', trimmed);
  }
}
