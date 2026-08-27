import React from 'react';
import { RoomState } from '../../engine/types';
import { PlayerSlots } from './PlayerSlots';
import { InviteCard } from './InviteCard';
import { Button } from '../ui/Button';
import { ArrowLeft, Play, Sun, Moon } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';

interface LobbyViewProps {
  roomState: RoomState;
  currentUserId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomState,
  currentUserId,
  onStartGame,
  onLeaveRoom,
}) => {
  const { theme, toggleTheme } = usePlayerStore();
  const isHost = roomState.hostId === currentUserId;
  const isReady = roomState.players.length === roomState.maxPlayers;

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-6 sm:py-10 space-y-6 select-none transition-colors" style={{ color: 'var(--text-ink)' }}>
      <div className="flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--text-ink-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar Room
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-btn transition-colors hover:opacity-80"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            style={{ color: 'var(--text-ink-secondary)' }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-ink-secondary)' }}>
            Lobby Permainan
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-ink)' }}>DOMINO ROOM</h1>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-ink-secondary)' }}>
          Tunggu hingga semua pemain masuk ke room untuk memulai pertandingan.
        </p>
      </div>

      <InviteCard roomCode={roomState.code} />
      <PlayerSlots players={roomState.players} maxPlayers={roomState.maxPlayers} currentUserId={currentUserId} />

      <div className="pt-4">
        {isHost ? (
          <Button size="lg" variant="primary" onClick={onStartGame} disabled={!isReady} className="w-full text-base font-semibold shadow-md min-h-[50px]">
            <Play className="w-4 h-4 fill-current" />
            {isReady ? 'Mulai Permainan' : `Menunggu Pemain (${roomState.players.length}/${roomState.maxPlayers})`}
          </Button>
        ) : (
          <div className="text-center py-3 rounded-card border" style={{ backgroundColor: 'var(--bg-surface-secondary)', borderColor: 'var(--border-color)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-ink-secondary)' }}>
              Menunggu Host memulai permainan...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
