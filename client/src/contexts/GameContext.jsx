/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import { useGame, PHASES } from '../hooks/useGame';

export { PHASES };

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const game = useGame();

  const gameValue = useMemo(() => game, [game]);

  return (
    <GameContext.Provider value={gameValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within a GameProvider');
  return ctx;
}




