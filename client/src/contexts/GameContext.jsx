import React, { createContext, useContext, useMemo } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { useGame, PHASES } from '../hooks/useGame';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { stations, lines, segments, loading: networkLoading } = useNetwork();
  const {
    phase,
    currentGame,
    selectedRoute,
    timeLeft,
    gameResult,
    execStep,
    walkProgress,
    startGame,
    submitRoute,
    handleStationClick,
    undoLastStep,
    setPhase,
    selectedCharacter,
    setSelectedCharacter,
  } = useGame(segments, stations, lines);

  const characterState = useMemo(() => {
    if (phase === PHASES.EXECUTION) {
      if (gameResult?.steps[execStep]?.isFailed) return 'lose';
      return 'walk';
    }
    if (phase === PHASES.RESULT) {
      const hasFailedStep = gameResult?.steps?.some(s => s.isFailed);
      if (hasFailedStep || gameResult?.isInvalid) return 'lose';
      if (gameResult?.score > 0) return 'win';
      return 'lose';
    }
    return 'idle';
  }, [phase, gameResult, execStep]);

  const currentSegment = useMemo(() => {
    if (phase === PHASES.EXECUTION && gameResult?.steps[execStep]) {
      return gameResult.steps[execStep].segment;
    }
    return null;
  }, [phase, gameResult, execStep]);

  const currentStationId = useMemo(() => {
    if (phase === PHASES.SETUP) return null;
    if (phase === PHASES.PLANNING) {
      return selectedRoute.length === 0
        ? currentGame?.start.id
        : selectedRoute[selectedRoute.length - 1].s2_id;
    }
    if (phase === PHASES.EXECUTION && gameResult?.steps) {
      if (execStep >= gameResult.steps.length) {
        return gameResult.steps[gameResult.steps.length - 1]?.segment.s2_id;
      }
      return gameResult.steps[execStep]?.segment.s1_id;
    }
    if (phase === PHASES.RESULT && gameResult?.steps?.length > 0) {
      const lastStep = gameResult.steps[gameResult.steps.length - 1];
      return lastStep.isFailed ? lastStep.segment.s1_id : lastStep.segment.s2_id;
    }
    return currentGame?.start.id;
  }, [phase, currentGame, selectedRoute, gameResult, execStep]);

  const highlightStations = useMemo(() => {
    if (phase === PHASES.PLANNING || phase === PHASES.EXECUTION || phase === PHASES.RESULT) {
      return [currentGame?.start.id, currentGame?.destination.id];
    }
    return [];
  }, [phase, currentGame]);

  const value = {
    // Network data
    stations,
    lines,
    networkLoading,
    // Game state
    PHASES,
    phase,
    currentGame,
    selectedRoute,
    timeLeft,
    gameResult,
    execStep,
    walkProgress,
    selectedCharacter,
    // Derived
    characterState,
    currentSegment,
    currentStationId,
    highlightStations,
    // Actions
    startGame,
    submitRoute,
    handleStationClick,
    undoLastStep,
    setPhase,
    setSelectedCharacter,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within a GameProvider');
  return ctx;
}
