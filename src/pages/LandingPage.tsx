import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { DominoTile } from '../components/domino/DominoTile';
import { usePlayerStore } from '../stores/playerStore';
import { useGameStore } from '../stores/gameStore';
import { PlayerCount } from '../engine/types';
import { cleanRoomCode, generateRoomCode } from '../engine/roomManager';
import { PlusCircle, LogIn, Users, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onEnterRoom: (roomCode: string) => void;
  prefilledCode?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterRoom,
  prefilledCode = '',
}) => {
  const { nickname, setNickname, theme, toggleTheme } = usePlayerStore();
  const { createRoom, connectRoom, joinRoom, showToast } = useGameStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(Boolean(prefilledCode));
  const [nameInput, setNameInput] = useState(nickname || '');
  const [maxPlayers, setMaxPlayers] = useState<PlayerCount>(4);
  const [codeInput, setCodeInput] = useState(prefilledCode);

  const handleOpenCreate = () => {
    setNameInput(nickname || '');
    setIsCreateModalOpen(true);
  };

  const handleOpenJoin = () => {
    setNameInput(nickname || '');
    setCodeInput(prefilledCode);
    setIsJoinModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) { showToast('Masukkan nama Anda terlebih dahulu'); return; }
    setNickname(trimmed);
    const newCode = generateRoomCode();
    connectRoom(newCode);
    createRoom(maxPlayers);
    setIsCreateModalOpen(false);
    onEnterRoom(newCode);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const cleanedCode = cleanRoomCode(codeInput);
    if (!trimmedName) { showToast('Masukkan nama Anda terlebih dahulu'); return; }
    if (cleanedCode.length < 4) { showToast('Masukkan kode room yang valid'); return; }
    setNickname(trimmedName);
    connectRoom(cleanedCode);
    joinRoom(cleanedCode, trimmedName);
    setIsJoinModalOpen(false);
    onEnterRoom(cleanedCode);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between px-4 py-6 sm:py-12 max-w-lg mx-auto w-full select-none transition-colors"
      style={{ color: 'var(--text-ink)' }}
    >
      {/* Top Header with Theme Toggle */}
      <div className="flex justify-end w-full">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-btn transition-colors hover:opacity-80"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle theme"
          style={{ color: 'var(--text-ink-secondary)' }}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-300" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Hero / Brand */}
      <div className="text-center space-y-4 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <DominoTile a={6} b={6} size="lg" isPlayable={false} />
          <DominoTile a={5} b={5} size="lg" orientation="horizontal" isPlayable={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: 'var(--text-ink)' }}>
            DOMINO
          </h1>
          <p className="text-sm sm:text-base max-w-xs mx-auto" style={{ color: 'var(--text-ink-secondary)' }}>
            Main domino bareng teman secara online langsung di browser.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.25 }}
          className="space-y-3 pt-6 w-full max-w-xs mx-auto"
        >
          <Button size="lg" variant="primary" onClick={handleOpenCreate} className="w-full font-semibold text-base shadow-md h-12">
            <PlusCircle className="w-4 h-4" />
            Buat Room
          </Button>
          <Button size="lg" variant="secondary" onClick={handleOpenJoin} className="w-full font-semibold text-base h-12">
            <LogIn className="w-4 h-4" />
            Gabung Room
          </Button>
        </motion.div>
      </div>

      {/* Footer Info */}
      <footer className="text-center pt-8 text-xs" style={{ color: 'var(--text-ink-muted)' }}>
        <span>Tanpa registrasi &middot; 2–4 Pemain &middot; Realtime</span>
      </footer>

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Room Baru"
        description="Pilih kapasitas pemain dan tentukan nama Anda."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-ink-secondary)' }}>
              Nama / Nickname
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Contoh: Raka"
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
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-ink-secondary)' }}>
              Jumlah Pemain
            </label>
            <SegmentedControl<PlayerCount>
              options={[
                { value: 2, label: '2 Pemain', sublabel: '14 kartu' },
                { value: 3, label: '3 Pemain', sublabel: '9 kartu' },
                { value: 4, label: '4 Pemain', sublabel: '7 kartu' },
              ]}
              value={maxPlayers}
              onChange={setMaxPlayers}
            />
          </div>
          <div className="pt-2">
            <Button type="submit" size="lg" variant="primary" className="w-full font-semibold">Buat Room</Button>
          </div>
        </form>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Gabung Room"
        description="Masukkan nama dan kode room 6-karakter dari teman Anda."
      >
        <form onSubmit={handleJoinSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-ink-secondary)' }}>
              Nama / Nickname
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Contoh: Dimas"
              maxLength={16}
              autoFocus={!prefilledCode}
              className="w-full px-3.5 py-2.5 rounded-btn border text-sm font-medium focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-ink)',
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-ink-secondary)' }}>
              Kode Room (6 Karakter)
            </label>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="DK7H2P"
              maxLength={6}
              autoFocus={Boolean(prefilledCode)}
              className="w-full px-3.5 py-2.5 rounded-btn border font-mono text-center tracking-widest text-lg font-bold uppercase focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-ink)',
              }}
            />
          </div>
          <div className="pt-2">
            <Button type="submit" size="lg" variant="primary" className="w-full font-semibold">
              <Users className="w-4 h-4" />
              Gabung Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
