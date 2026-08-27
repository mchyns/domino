import React from 'react';
import { Volume2, VolumeX, LogOut, Copy, Check, Sun, Moon } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { copyToClipboard } from '../../lib/utils';
import { useState } from 'react';

interface GameHUDProps {
  roomCode: string;
  onLeaveRoom: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ roomCode, onLeaveRoom }) => {
  const { isMuted, toggleMute, theme, toggleTheme } = usePlayerStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(roomCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header
      className="w-full flex items-center justify-between px-3 sm:px-6 py-2.5 border-b backdrop-blur-sm sticky top-0 z-30 select-none transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left: Brand & Room Code */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-ink)' }}>
          DOMINO
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium transition-colors"
          title="Klik untuk salin kode"
          style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            color: 'var(--text-ink-secondary)',
            borderWidth: '1px',
            borderColor: 'var(--border-color)',
          }}
        >
          <span>{roomCode}</span>
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3" style={{ color: 'var(--text-ink-muted)' }} />
          )}
        </button>
      </div>

      {/* Right: Theme, Sound & Leave */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-btn transition-colors hover:opacity-80"
          aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          style={{ color: 'var(--text-ink-secondary)' }}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-btn transition-colors hover:opacity-80"
          aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          style={{ color: isMuted ? 'var(--text-ink-muted)' : 'var(--text-ink)' }}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Leave Room Button */}
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-btn transition-colors hover:text-red-500 hover:bg-red-50"
          style={{ color: 'var(--text-ink-secondary)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
