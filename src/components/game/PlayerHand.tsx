import React from 'react';
import { DominoTileData, LegalMoveInfo } from '../../engine/types';
import { DominoTile } from '../domino/DominoTile';
import { Button } from '../ui/Button';
import { SkipForward } from 'lucide-react';

interface PlayerHandProps {
  hand: DominoTileData[];
  legalMoves: Record<string, LegalMoveInfo>;
  isMyTurn: boolean;
  selectedTileId: string | null;
  onTileClick: (tile: DominoTileData) => void;
  onPassTurn: () => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  legalMoves,
  isMyTurn,
  selectedTileId,
  onTileClick,
  onPassTurn,
}) => {
  const hasAnyLegal = Object.values(legalMoves).some(
    (m) => m.canPlayLeft || m.canPlayRight
  );
  const canPass = isMyTurn && !hasAnyLegal;

  return (
    <div
      className="w-full border-t p-3 sm:p-4 backdrop-blur-md select-none sticky bottom-0 z-30 shadow-lg transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
        {/* Hand Header: Title & Pass Button */}
        <div className="w-full flex items-center justify-between px-1">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-ink-secondary)' }}
          >
            Kartu Tangan ({hand.length})
          </span>
          <Button
            size="sm"
            variant={canPass ? 'primary' : 'outline'}
            disabled={!canPass}
            onClick={onPassTurn}
            className="h-8 px-3 text-xs font-medium"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Pass
          </Button>
        </div>

        {/* Tiles Row */}
        <div className="w-full overflow-x-auto overflow-y-visible py-2 px-1 flex items-center justify-start sm:justify-center gap-2 sm:gap-3 no-scrollbar touch-pan-x min-h-[96px] sm:min-h-[110px]">
          {hand.length === 0 ? (
            <div className="text-xs italic py-4" style={{ color: 'var(--text-ink-muted)' }}>
              Tidak ada kartu tersisa di tangan
            </div>
          ) : (
            hand.map((tile, idx) => {
              const moveInfo = legalMoves[tile.id];
              const isLegal = isMyTurn && (moveInfo?.canPlayLeft || moveInfo?.canPlayRight);
              const isDisabled = isMyTurn && !isLegal;
              const isSelected = selectedTileId === tile.id;

              return (
                <DominoTile
                  key={tile.id}
                  a={tile.a}
                  b={tile.b}
                  size="hand"
                  orientation="vertical"
                  isDisabled={isDisabled}
                  isPlayable={isMyTurn && isLegal}
                  isSelected={isSelected}
                  animateEntrance={true}
                  entranceDelay={idx * 0.04}
                  onClick={() => onTileClick(tile)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
