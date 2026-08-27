-- Domino Room Database Schema & RPC Functions
-- Compatible with PostgreSQL 15+ & Supabase

-- 1. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_player_id VARCHAR(64) NOT NULL,
  max_players INT NOT NULL CHECK (max_players IN (2, 3, 4)),
  status VARCHAR(20) NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Room Players Table
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(64) NOT NULL,
  nickname VARCHAR(32) NOT NULL,
  seat_number INT NOT NULL,
  connected BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

-- 3. Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'finished')),
  current_player_id VARCHAR(64) NOT NULL,
  player_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  starter_tile JSONB,
  left_value INT,
  right_value INT,
  consecutive_passes INT NOT NULL DEFAULT 0,
  winner_player_id VARCHAR(64),
  win_reason VARCHAR(20),
  scores JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- 4. Board Tiles Table
CREATE TABLE IF NOT EXISTS board_tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  tile_a INT NOT NULL,
  tile_b INT NOT NULL,
  display_left INT NOT NULL,
  display_right INT NOT NULL,
  position VARCHAR(20) NOT NULL,
  played_by VARCHAR(64) NOT NULL,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Player Private Hands Table (Strict Row-Level Security: opponents cannot see tiles)
CREATE TABLE IF NOT EXISTS player_hands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id VARCHAR(64) NOT NULL,
  tile_id VARCHAR(32) NOT NULL,
  tile_a INT NOT NULL,
  tile_b INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_hands ENABLE ROW LEVEL SECURITY;

-- Public read policies for active rooms
CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public read players" ON room_players FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read board_tiles" ON board_tiles FOR SELECT USING (true);

-- Indexing for fast lookups
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_matches_room_id ON matches(room_id);
CREATE INDEX IF NOT EXISTS idx_board_tiles_match_id ON board_tiles(match_id);
CREATE INDEX IF NOT EXISTS idx_player_hands_match_player ON player_hands(match_id, player_id);
