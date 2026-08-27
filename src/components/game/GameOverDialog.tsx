import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MatchState, PlayerPublicInfo } from '../../engine/types';
import { Trophy, RotateCcw, LogOut } from 'lucide-react';
import { DominoTile } from '../domino/DominoTile';

interface GameOverDialogProps {
  match: MatchState;
  players: PlayerPublicInfo[];
  currentUserId: string;
  isHost: boolean;
  onRematch: () => void;
  onLeaveRoom: () => void;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({
  match,
  players,
  currentUserId,
  isHost,
  onRematch,
  onLeaveRoom,
}) => {
  const isFinished = match.status === 'finished';
  if (!isFinished) return null;

  const winner = players.find((p) => p.id === match.winnerPlayerId);
  const isWinnerMe = match.winnerPlayerId === currentUserId;

  return (
    <Modal
      isOpen={isFinished}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="text-center space-y-4 py-2 select-none text-ink dark:text-ink-dark">
        {/* Trophy Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-darkSubtle text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-700/50 shadow-sm">
          <Trophy className="w-6 h-6" />
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink dark:text-ink-dark">
            {isWinnerMe
              ? 'Selamat, Anda Menang!'
              : `${winner?.nickname || 'Pemain'} Menang!`}
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-secondaryDark mt-1">
            {match.winReason === 'domino'
              ? 'Menghabiskan seluruh kartu di tangan (Domino).'
              : 'Permainan terkunci (Blocked). Menang dengan total pip terkecil.'}
          </p>
        </div>

        {/* Results Scores Table */}
        {match.scores && (
          <div className="bg-surface-secondary/70 dark:bg-surface-secondaryDark/80 rounded-card border border-border/80 dark:border-border-dark p-3 sm:p-4 text-left space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary dark:text-ink-secondaryDark block">
              Hasil Akhir
            </span>
            <div className="divide-y divide-border/60 dark:divide-border-dark">
              {match.scores.map((score, idx) => {
                const isItemWinner = score.playerId === match.winnerPlayerId;
                const isMe = score.playerId === currentUserId;

                return (
                  <div
                    key={score.playerId}
                    className="py-2 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-ink-muted dark:text-ink-mutedDark w-4">
                        #{idx + 1}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          isItemWinner
                            ? 'font-bold text-ink dark:text-ink-dark'
                            : 'font-medium text-ink-secondary dark:text-ink-secondaryDark'
                        }`}
                      >
                        {score.nickname} {isMe && '(Anda)'}
                      </span>
                      {isItemWinner && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded-full border border-amber-300/50 dark:border-amber-700/60">
                          Juara
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Mini tiles list */}
                      {score.remainingTiles && score.remainingTiles.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1">
                          {score.remainingTiles.map((t) => (
                            <DominoTile
                              key={t.id}
                              a={t.a}
                              b={t.b}
                              size="sm"
                              isPlayable={false}
                            />
                          ))}
                        </div>
                      )}

                      <span className="font-mono text-sm font-semibold text-ink dark:text-ink-dark">
                        {score.pipTotal} Poin
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              onClick={onRematch}
              className="w-full text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              Main Lagi (Rematch)
            </Button>
          ) : (
            <div className="py-2.5 px-3 bg-surface-secondary dark:bg-surface-secondaryDark rounded-btn border border-border/80 dark:border-border-dark text-xs font-medium text-ink-secondary dark:text-ink-secondaryDark">
              Menunggu Host memulai rematch...
            </div>
          )}

          <Button
            variant="ghost"
            size="md"
            onClick={onLeaveRoom}
            className="w-full text-xs text-ink-secondary dark:text-ink-secondaryDark hover:text-ink dark:hover:text-ink-dark"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Room
          </Button>
        </div>
      </div>
    </Modal>
  );
};
