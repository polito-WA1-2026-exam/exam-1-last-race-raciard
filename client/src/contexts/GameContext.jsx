/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { useGame, PHASES } from '../hooks/useGame';

export { PHASES };

const NetworkContext = createContext(null);
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const network = useNetwork();
  const game = useGame();

  const networkValue = useMemo(() => network, [network]);
  const gameValue = useMemo(() => game, [game]);

  return (
    <NetworkContext.Provider value={networkValue}>
      <GameContext.Provider value={gameValue}>
        {children}
      </GameContext.Provider>
    </NetworkContext.Provider>
  );
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within a GameProvider');
  return ctx;
}

export function useNetworkContext() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetworkContext must be used within a GameProvider');
  return ctx;
}



