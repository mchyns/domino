import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { LobbyView } from '../components/lobby/LobbyView';
import { GameHUD } from '../components/game/GameHUD';
import { PlayerSeat } from '../components/game/PlayerSeat';
import { DominoBoard } from '../components/game/DominoBoard';
import { TurnBanner } from '../components/game/TurnBanner';
import { PlayerHand } from '../components/game/PlayerHand';
import { PlacementSelector } from '../components/game/PlacementSelector';
import { GameOverDialog } from '../components/game/GameOverDialog';
import { DominoTileData } from '../engine/types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Users, RotateCcw, ArrowLeft } from 'lucide-react';

interface RoomPageProps {
  roomCode: string;
  onLeave: () => void;
}

export const RoomPage: React.FC<RoomPageProps> = ({ roomCode, onLeave }) => {
  const { userId, nickname, setNickname } = usePlayerStore();
  const {
    roomState,
    privateHand,
    selectedTileId,
    connectRoom,
    joinRoom,
    startGame,
    playTile,
    passTurn,
    requestRematch,
    leaveRoom,
    selectTile,
    getLegalMoves,
    showToast,
  } = useGameStore();

  const [dualChoiceTile, setDualChoiceTile] = useState<DominoTileData | null>(null);
  const [askNameModalOpen, setAskNameModalOpen] = useState(!nickname);
  const [tempName, setTempName] = useState(nickname || '');

  useEffect(() => {
    if (nickname) {
      joinRoom(roomCode, nickname);
    } else {
      setAskNameModalOpen(true);
    }
  }, [roomCode]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    if (!trimmed) {
      showToast('Masukkan nama Anda terlebih dahulu');
      return;
    }
    setNickname(trimmed);
    setAskNameModalOpen(false);
    joinRoom(roomCode, trimmed);
  };

  const handleTileClick = (tile: DominoTileData) => {
    if (!roomState?.match) return;
    if (roomState.match.currentPlayerId !== userId) return;
    const moves = getLegalMoves();
    const moveInfo = moves[tile.id];
    if (!moveInfo) return;
    if (moveInfo.canPlayLeft && moveInfo.canPlayRight) {
      setDualChoiceTile(tile);
      selectTile(tile.id);
    } else if (moveInfo.canPlayLeft) {
      playTile(tile.id, 'left');
    } else if (moveInfo.canPlayRight) {
      playTile(tile.id, 'right');
    }
  };

  const handleSelectSide = (side: 'left' | 'right') => {
    if (dualChoiceTile) {
      playTile(dualChoiceTile.id, side);
      setDualChoiceTile(null);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    onLeave();
  };

  const handleRetry = () => {
    if (nickname) {
      joinRoom(roomCode, nickname);
    } else {
      setAskNameModalOpen(true);
    }
  };

  if (!roomState) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 select-none transition-colors"
        style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-ink)' }}
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div
            className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
            style={{
              borderColor: 'var(--text-ink)',
              borderTopColor: 'transparent',
            }}
          />
          <div className="space-y-1">
            <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-ink)' }}>
              Menghubungkan ke Room {roomCode}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-ink-secondary)' }}>
              Menyambungkan realtime ke host permainan...
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRetry}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Coba Ulang
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onLeave}
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </Button>
          </div>
        </div>

        {/* Modal Ask Name if user opened via direct URL */}
        <Modal
          isOpen={askNameModalOpen}
          onClose={onLeave}
          title="Gabung Permainan"
          description={`Masukkan nama Anda untuk masuk ke room ${roomCode}`}
        >
          <form onSubmit={handleNameSubmit} className="space-y-4 pt-2">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-ink-secondary)' }}
              >
                Nama / Nickname
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Contoh: Budi"
                maxLength={16}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-btn border text-sm font-medium focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-ink)',
                }}
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="w-full font-semibold"
              >
                <Users className="w-4 h-4" />
                Masuk ke Room
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  if (roomState.status === 'lobby' || !roomState.match) {
    return (
      <LobbyView
        roomState={roomState}
        currentUserId={userId}
        onStartGame={startGame}
        onLeaveRoom={handleLeave}
      />
    );
  }

  const match = roomState.match;
  const isMyTurn = match.currentPlayerId === userId;
  const currentPlayer = roomState.players.find((p) => p.id === match.currentPlayerId);
  const legalMoves = getLegalMoves();
  const isHost = roomState.hostId === userId;

  const myIndex = roomState.players.findIndex((p) => p.id === userId);
  const otherPlayers: Array<{
    player: (typeof roomState.players)[0];
    position: 'top' | 'left' | 'right';
  }> = [];

  if (myIndex !== -1) {
    const total = roomState.players.length;
    for (let i = 1; i < total; i++) {
      const p = roomState.players[(myIndex + i) % total];
      if (total === 2) {
        otherPlayers.push({ player: p, position: 'top' });
      } else if (total === 3) {
        if (i === 1) otherPlayers.push({ player: p, position: 'left' });
        if (i === 2) otherPlayers.push({ player: p, position: 'top' });
      } else if (total === 4) {
        if (i === 1) otherPlayers.push({ player: p, position: 'left' });
        if (i === 2) otherPlayers.push({ player: p, position: 'top' });
        if (i === 3) otherPlayers.push({ player: p, position: 'right' });
      }
    }
  }

  const topPlayer = otherPlayers.find((o) => o.position === 'top')?.player;
  const leftPlayer = otherPlayers.find((o) => o.position === 'left')?.player;
  const rightPlayer = otherPlayers.find((o) => o.position === 'right')?.player;

  return (
    <div
      className="min-h-screen flex flex-col justify-between overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-ink)' }}
    >
      <GameHUD roomCode={roomState.code} onLeaveRoom={handleLeave} />

      <main className="flex-1 flex flex-col justify-between p-2 sm:p-4 max-w-5xl mx-auto w-full relative">
        <div className="w-full flex justify-center py-1">
          {topPlayer && (
            <PlayerSeat
              player={topPlayer}
              isCurrentTurn={match.currentPlayerId === topPlayer.id}
              position="top"
            />
          )}
        </div>

        <div className="flex-1 flex items-center justify-between gap-2 my-auto w-full">
          <div className="w-20 sm:w-28 flex justify-start shrink-0">
            {leftPlayer && (
              <PlayerSeat
                player={leftPlayer}
                isCurrentTurn={match.currentPlayerId === leftPlayer.id}
                position="left"
              />
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <DominoBoard
              board={match.board}
              leftValue={match.leftValue}
              rightValue={match.rightValue}
              isMyTurn={isMyTurn}
            />
          </div>
          <div className="w-20 sm:w-28 flex justify-end shrink-0">
            {rightPlayer && (
              <PlayerSeat
                player={rightPlayer}
                isCurrentTurn={match.currentPlayerId === rightPlayer.id}
                position="right"
              />
            )}
          </div>
        </div>

        <TurnBanner
          isMyTurn={isMyTurn}
          currentPlayerNickname={currentPlayer?.nickname || 'Pemain'}
          lastAction={match.lastAction}
        />
      </main>

      <PlayerHand
        hand={privateHand}
        legalMoves={legalMoves}
        isMyTurn={isMyTurn}
        selectedTileId={selectedTileId}
        onTileClick={handleTileClick}
        onPassTurn={passTurn}
      />
      <PlacementSelector
        tile={dualChoiceTile}
        leftValue={match.leftValue}
        rightValue={match.rightValue}
        onSelectSide={handleSelectSide}
        onCancel={() => setDualChoiceTile(null)}
      />
      <GameOverDialog
        match={match}
        players={roomState.players}
        currentUserId={userId}
        isHost={isHost}
        onRematch={requestRematch}
        onLeaveRoom={handleLeave}
      />
    </div>
  );
};
