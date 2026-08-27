import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { RoomPage } from './pages/RoomPage';
import { Toast } from './components/ui/Toast';
import { useGameStore } from './stores/gameStore';
import { usePlayerStore, applyThemeClass } from './stores/playerStore';
import { cleanRoomCode } from './engine/roomManager';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'room'>('landing');
  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const { toastMessage, clearToast } = useGameStore();
  const { theme } = usePlayerStore();

  // Sync theme to DOM on mount and changes
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // Parse path on initial load & popstate
  useEffect(() => {
    const parseUrl = () => {
      const pathname = window.location.pathname;
      const roomMatch = pathname.match(/^\/room\/([A-Za-z0-9]+)/i);

      if (roomMatch && roomMatch[1]) {
        const code = cleanRoomCode(roomMatch[1]);
        if (code) {
          setActiveRoomCode(code);
          setCurrentRoute('room');
          return;
        }
      }

      setCurrentRoute('landing');
      setActiveRoomCode('');
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  const handleEnterRoom = (code: string) => {
    const cleaned = cleanRoomCode(code);
    setActiveRoomCode(cleaned);
    setCurrentRoute('room');
    window.history.pushState({}, '', `/room/${cleaned}`);
  };

  const handleLeaveRoom = () => {
    setActiveRoomCode('');
    setCurrentRoute('landing');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col font-sans transition-colors duration-150">
      {currentRoute === 'landing' ? (
        <LandingPage
          onEnterRoom={handleEnterRoom}
          prefilledCode={activeRoomCode}
        />
      ) : (
        <RoomPage roomCode={activeRoomCode} onLeave={handleLeaveRoom} />
      )}

      {/* Global Toast */}
      <Toast message={toastMessage} onClose={clearToast} />
    </div>
  );
}

export default App;
