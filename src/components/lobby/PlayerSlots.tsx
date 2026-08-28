import React from 'react';
import { PlayerPublicInfo, PlayerCount } from '../../engine/types';
import { Crown, User, Bot, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerSlotsProps {
  players: PlayerPublicInfo[];
  maxPlayers: PlayerCount;
  currentUserId: string;
  isHost: boolean;
  onAddBot?: () => void;
  onRemoveBot?: (botId: string) => void;
}

export const PlayerSlots: React.FC<PlayerSlotsProps> = ({
  players,
  maxPlayers,
  currentUserId,
  isHost,
  onAddBot,
  onRemoveBot,
}) => {
  const slots = Array.from({ length: maxPlayers }).map((_, index) => players[index] || null);

  return (
    <div className="w-full space-y-2.5 select-none">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider px-1" style={{ color: 'var(--text-ink-secondary)' }}>
        <span>Pemain</span>
        <span>{players.length} / {maxPlayers}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {slots.map((player, idx) => {
          if (player) {
            const isMe = player.id === currentUserId;
            const isBotPlayer = player.isBot;
            const initial = player.nickname.charAt(0).toUpperCase() || 'P';

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-card border shadow-sm transition-colors"
                style={{
                  backgroundColor: isBotPlayer ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface)',
                  borderColor: isBotPlayer ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full font-semibold flex items-center justify-center text-sm border shrink-0"
                    style={{
                      backgroundColor: isBotPlayer ? '#065F46' : 'var(--bg-surface-secondary)',
                      color: isBotPlayer ? '#FFFFFF' : 'var(--text-ink)',
                      borderColor: isBotPlayer ? '#10B981' : 'var(--border-color)',
                    }}
                  >
                    {isBotPlayer ? <Bot className="w-4 h-4 text-emerald-200" /> : initial}
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
                      {isBotPlayer ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Bot
                        </span>
                      ) : (
                        <>
                          <span className={`w-1.5 h-1.5 rounded-full ${player.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {player.isConnected ? 'Terhubung' : 'Terputus'}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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

                  {/* Remove Bot button for Host */}
                  {isHost && isBotPlayer && onRemoveBot && (
                    <button
                      onClick={() => onRemoveBot(player.id)}
                      className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Hapus Bot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          }

          return (
            <div
              key={`empty_${idx}`}
              className="flex items-center justify-between p-3 rounded-card border border-dashed transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-ink-muted)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-dashed flex items-center justify-center shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--text-ink-muted)', opacity: 0.6 }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-ink-secondary)' }}>
                  Slot Kosong...
                </span>
              </div>

              {isHost && onAddBot && (
                <button
                  onClick={onAddBot}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border border-emerald-600/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                  title="Tambah Bot"
                >
                  <Plus className="w-3 h-3" />
                  Bot
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
