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

interface RoomPageProps {
  roomCode: string;
  onLeave: () => void;
}

export const RoomPage: React.FC<RoomPageProps> = ({ roomCode, onLeave }) => {
  const { userId, nickname } = usePlayerStore();
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
  } = useGameStore();

  const [dualChoiceTile, setDualChoiceTile] = useState<DominoTileData | null>(null);

  useEffect(() => {
    if (!roomState || roomState.code !== roomCode) {
      if (nickname) {
        joinRoom(roomCode, nickname);
      } else {
        connectRoom(roomCode);
      }
    }
  }, [roomCode]);

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

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-ink)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--text-ink)', borderTopColor: 'transparent' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-ink-secondary)' }}>
            Menghubungkan ke room {roomCode}...
          </span>
        </div>
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
  const otherPlayers: Array<{ player: (typeof roomState.players)[0]; position: 'top' | 'left' | 'right' }> = [];

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
    <div className="min-h-screen flex flex-col justify-between overflow-hidden transition-colors" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-ink)' }}>
      <GameHUD roomCode={roomState.code} onLeaveRoom={handleLeave} />

      <main className="flex-1 flex flex-col justify-between p-2 sm:p-4 max-w-5xl mx-auto w-full relative">
        <div className="w-full flex justify-center py-1">
          {topPlayer && (
            <PlayerSeat player={topPlayer} isCurrentTurn={match.currentPlayerId === topPlayer.id} position="top" />
          )}
        </div>

        <div className="flex-1 flex items-center justify-between gap-2 my-auto w-full">
          <div className="w-20 sm:w-28 flex justify-start shrink-0">
            {leftPlayer && (
              <PlayerSeat player={leftPlayer} isCurrentTurn={match.currentPlayerId === leftPlayer.id} position="left" />
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <DominoBoard board={match.board} leftValue={match.leftValue} rightValue={match.rightValue} isMyTurn={isMyTurn} />
          </div>
          <div className="w-20 sm:w-28 flex justify-end shrink-0">
            {rightPlayer && (
              <PlayerSeat player={rightPlayer} isCurrentTurn={match.currentPlayerId === rightPlayer.id} position="right" />
            )}
          </div>
        </div>

        <TurnBanner isMyTurn={isMyTurn} currentPlayerNickname={currentPlayer?.nickname || 'Pemain'} lastAction={match.lastAction} />
      </main>

      <PlayerHand hand={privateHand} legalMoves={legalMoves} isMyTurn={isMyTurn} selectedTileId={selectedTileId} onTileClick={handleTileClick} onPassTurn={passTurn} />
      <PlacementSelector tile={dualChoiceTile} leftValue={match.leftValue} rightValue={match.rightValue} onSelectSide={handleSelectSide} onCancel={() => setDualChoiceTile(null)} />
      <GameOverDialog match={match} players={roomState.players} currentUserId={userId} isHost={isHost} onRematch={requestRematch} onLeaveRoom={handleLeave} />
    </div>
  );
};
