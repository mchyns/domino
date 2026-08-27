import React, { useMemo, useRef, useState, useEffect } from 'react';
import { BoardTile } from '../../engine/types';
import { DominoTile } from '../domino/DominoTile';
import { motion, AnimatePresence } from 'framer-motion';

interface DominoBoardProps {
  board: BoardTile[];
  leftValue?: number | null;
  rightValue?: number | null;
  isMyTurn: boolean;
}

interface PositionedTile {
  tile: BoardTile;
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
  reversed: boolean;
  width: number;
  height: number;
}

const TILE_W = 64;       // Horizontal tile length (and vertical tile height)
const TILE_H = 32;       // Horizontal tile height (and vertical tile width)
const ROW_PITCH = 64;    // Distance between horizontal lanes
const MAX_ROW_REACH = 230; // Max horizontal reach (5-6 tiles) before elbow turn

export const DominoBoard: React.FC<DominoBoardProps> = ({
  board,
  isMyTurn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 280 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 600,
          height: containerRef.current.clientHeight || 280,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Compute exact Higgs Domino Serpentine Track layout
  const { positionedTiles, bounds } = useMemo(() => {
    if (board.length === 0) {
      return {
        positionedTiles: [] as PositionedTile[],
        bounds: { width: 200, height: 120 },
      };
    }

    const positions: PositionedTile[] = [];

    let curX = -100;
    let lane = 0;
    let dirX = 1; // 1 = moving right (+X), -1 = moving left (-X)

    for (let i = 0; i < board.length; i++) {
      const tile = board[i];
      const isDouble = tile.isDouble;

      if (isDouble) {
        // Balak (kembar) stands vertically inline with the current lane
        const tileX = curX + (dirX * TILE_H) / 2;
        const tileY = lane * ROW_PITCH;

        positions.push({
          tile,
          x: tileX,
          y: tileY,
          orientation: 'vertical',
          reversed: false,
          width: TILE_H, // 32
          height: TILE_W,// 64
        });

        curX += dirX * TILE_H;
      } else {
        // Non-double tile: check if we reached the boundary and should turn down
        const needsTurn =
          (dirX === 1 && curX + TILE_W > MAX_ROW_REACH && i < board.length - 1) ||
          (dirX === -1 && curX - TILE_W < -MAX_ROW_REACH && i < board.length - 1);

        if (needsTurn) {
          // Vertical elbow turn tile spanning from current lane to next lane below
          const cornerX = curX + (dirX * TILE_H) / 2;
          const cornerY = lane * ROW_PITCH + ROW_PITCH / 2;

          positions.push({
            tile,
            x: cornerX,
            y: cornerY,
            orientation: 'vertical',
            reversed: false,
            width: TILE_H, // 32
            height: TILE_W,// 64
          });

          // Switch to next lane below and reverse horizontal direction
          lane += 1;
          dirX = dirX === 1 ? -1 : 1;
          curX = cornerX + (dirX * TILE_H) / 2;
        } else {
          // Normal horizontal tile in current lane
          const tileX = curX + (dirX * TILE_W) / 2;
          const tileY = lane * ROW_PITCH;
          const reversed = dirX === -1;

          positions.push({
            tile,
            x: tileX,
            y: tileY,
            orientation: 'horizontal',
            reversed,
            width: TILE_W, // 64
            height: TILE_H,// 32
          });

          curX += dirX * TILE_W;
        }
      }
    }

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach((p) => {
      minX = Math.min(minX, p.x - p.width / 2);
      maxX = Math.max(maxX, p.x + p.width / 2);
      minY = Math.min(minY, p.y - p.height / 2);
      maxY = Math.max(maxY, p.y + p.height / 2);
    });

    const width = Math.max(160, maxX - minX + 36);
    const height = Math.max(100, maxY - minY + 36);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Center the entire snake at (0, 0)
    const centeredPositions = positions.map((p) => ({
      ...p,
      x: p.x - centerX,
      y: p.y - centerY,
    }));

    return {
      positionedTiles: centeredPositions,
      bounds: { width, height },
    };
  }, [board]);

  // Compute dynamic scale so all tiles fit 100% within container
  const scale = useMemo(() => {
    const paddingX = containerSize.width < 640 ? 32 : 56;
    const paddingY = 36;
    const availW = Math.max(120, containerSize.width - paddingX);
    const availH = Math.max(120, containerSize.height - paddingY);

    const scaleX = availW / bounds.width;
    const scaleY = availH / bounds.height;
    return Math.min(1.05, Math.min(scaleX, scaleY));
  }, [containerSize, bounds]);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex flex-col items-center justify-center select-none overflow-hidden min-h-[160px] sm:min-h-[240px] max-h-[380px] p-1"
    >
      {/* Table Area Canvas */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {board.length === 0 ? (
            <motion.div
              key="empty_board"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-6 px-10 border-2 border-dashed rounded-card text-center"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
              }}
            >
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-emerald-100">
                Meja Permainan Siap
              </span>
              <span className="text-[11px] mt-1 text-emerald-200/60">
                {isMyTurn
                  ? 'Mainkan kartu pertama Anda'
                  : 'Menunggu pemain pertama meletakkan kartu'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="active_board"
              className="absolute flex items-center justify-center pointer-events-none"
              animate={{ scale }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 28,
              }}
              style={{
                transformOrigin: 'center center',
                width: 0,
                height: 0,
              }}
            >
              {/* Exact Higgs Domino Serpentine Grid */}
              {positionedTiles.map((pos, idx) => {
                const { tile, x, y, orientation, reversed, width, height } = pos;

                return (
                  <motion.div
                    key={tile.id}
                    initial={{ opacity: 0, scale: 0.6, y: y - 10 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: x - width / 2,
                      y: y - height / 2,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 28,
                      delay: idx === 0 || idx === board.length - 1 ? 0.04 : 0,
                    }}
                    className="absolute pointer-events-auto shrink-0 flex items-center justify-center"
                    style={{
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                  >
                    <DominoTile
                      a={tile.a}
                      b={tile.b}
                      displayLeft={tile.displayLeft}
                      displayRight={tile.displayRight}
                      orientation={orientation}
                      reversed={reversed}
                      size="board"
                      isPlayable={false}
                      className="w-full h-full"
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
