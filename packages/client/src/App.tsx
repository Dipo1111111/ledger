import { useState } from 'react';
import { useSocket } from './hooks/use-socket';
import { useLobbyStore } from './store/lobby-store';
import { useGameStore } from './store/game-store';
import { LandingPage } from './components/landing/LandingPage';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';
import { EndScreen } from './screens/EndScreen';
import { ConnectionStatus } from './components/common/ConnectionStatus';
import { ToastContainer } from './components/common/ToastContainer';

export function App() {
  /* Connect socket and wire listeners (once per session) */
  useSocket();

  const roomCode = useLobbyStore((s) => s.roomCode);
  const gameState = useGameStore((s) => s.gameState);

  /* Navigation: Landing page -> Lobby -> Game */
  const [showLobby, setShowLobby] = useState(false);

  const inLobby = roomCode !== null;
  const inGame = gameState !== null && gameState.phase !== 'finished';
  const viewingLobby = showLobby || inLobby;

  // Show end screen when game has finished
  if (gameState && gameState.phase === 'finished') {
    return (
      <>
        <EndScreen gameState={gameState} />
        <ConnectionStatus />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {inGame ? (
        <GameScreen />
      ) : viewingLobby ? (
        <LobbyScreen onBack={() => { useLobbyStore.getState().reset(); setShowLobby(false); }} />
      ) : (
        <LandingPage onStartGame={() => setShowLobby(true)} />
      )}
      <ConnectionStatus />
      <ToastContainer />
    </>
  );
}
