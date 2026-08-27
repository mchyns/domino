import React from 'react';
import { PlayerPublicInfo, PlayerCount } from '../../engine/types';
import { Crown, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerSlotsProps {
  players: PlayerPublicInfo[];
  maxPlayers: PlayerCount;
  currentUserId: string;
}

export const PlayerSlots: React.FC<PlayerSlotsProps> = ({
  players,
  maxPlayers,
  currentUserId,
}) => {
  const slots = Array.from({ length: maxPlayers }).map((_, index) => players[index] || null);

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider px-1" style={{ color: 'var(--text-ink-secondary)' }}>
        <span>Pemain</span>
        <span>{players.length} / {maxPlayers}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {slots.map((player, idx) => {
          if (player) {
            const isMe = player.id === currentUserId;
            const initial = player.nickname.charAt(0).toUpperCase() || 'P';

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-card border shadow-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full font-semibold flex items-center justify-center text-sm border shrink-0"
                    style={{
                      backgroundColor: 'var(--bg-surface-secondary)',
                      color: 'var(--text-ink)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-ink)' }}>
                        {player.nickname}
                      </span>
                      {isMe && (
                        <span className="text-[11px] font-normal" style={{ color: 'var(--text-ink-secondary)' }}>(Anda)</span>
                      )}
                    </div>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-ink-secondary)' }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${player.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {player.isConnected ? 'Terhubung' : 'Terputus'}
                    </span>
                  </div>
                </div>
                <div>
                  {player.isHost && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: 'var(--bg-surface-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      <Crown className="w-3 h-3" />
                      Host
                    </span>
                  )}
                </div>
              </motion.div>
            );
          }

          return (
            <div
              key={`empty_${idx}`}
              className="flex items-center gap-3 p-3 rounded-card border border-dashed"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-ink-muted)' }}
            >
              <div className="w-9 h-9 rounded-full border border-dashed flex items-center justify-center shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                <User className="w-4 h-4" style={{ color: 'var(--text-ink-muted)', opacity: 0.6 }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-ink-secondary)' }}>
                Menunggu pemain...
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
