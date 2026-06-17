import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { computeSubwayLayout } from '../utils/layoutAlgorithm';

export const PHASES = {
  SETUP: 'SETUP',
  PLANNING: 'PLANNING',
  EXECUTION: 'EXECUTION',
  RESULT: 'RESULT'
};

export function useGame(allSegments, stations = [], lines = []) {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [selectedCharacter, setSelectedCharacter] = useState('Player');
  const [currentGame, setCurrentGame] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [execStep, setExecStep] = useState(0);
  const [walkProgress, setWalkProgress] = useState(0);

  const timerRef = useRef(null);
  const animRef = useRef(null);
  const coordsRef = useRef({});

  // Keep a memoised copy of the layout coords so the animation closure can access them
  useEffect(() => {
    if (stations.length && lines.length) {
      coordsRef.current = computeSubwayLayout(stations, lines, 1000, 1000);
    }
  }, [stations, lines]);

  const getCoords = (stationId) => {
    return coordsRef.current[stationId] ?? { x: 0, y: 0 };
  };

  // Timer logic
  useEffect(() => {
    if (phase === PHASES.PLANNING && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (phase === PHASES.PLANNING && timeLeft === 0) {
      submitRoute();
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, timeLeft]);

  // Execution animation
  useEffect(() => {
    if (phase === PHASES.EXECUTION && gameResult) {
      if (execStep < gameResult.steps.length) {
        const currentStep = gameResult.steps[execStep];

        // IMMEDIATE DEATH: If the current segment is failed, die immediately
        if (currentStep?.isFailed) {
          setPhase(PHASES.RESULT);
          cancelAnimationFrame(animRef.current);
          return;
        }

        // Calculate Dynamic Duration based on distance for constant speed
        const p1 = getCoords(currentStep.segment.s1_id);
        const p2 = getCoords(currentStep.segment.s2_id);
        const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

        const speed = 0.25; // Pixels per ms
        const duration = distance / speed;

        let start = null;
        const animate = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setWalkProgress(progress);

          if (progress < 1) {
            animRef.current = requestAnimationFrame(animate);
          } else {
            // Step complete
            setTimeout(() => {
              setWalkProgress(0);
              setExecStep(prev => prev + 1);
            }, 200);
          }
        };

        animRef.current = requestAnimationFrame(animate);
      } else {
        const timer = setTimeout(() => setPhase(PHASES.RESULT), 1000);
        return () => clearTimeout(timer);
      }
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, gameResult, execStep, stations]);
  const startGame = async () => {
    try {
      const data = await api.post('/games');
      setCurrentGame(data);
      setSelectedRoute([]);
      setGameResult(null);
      setExecStep(0);
      setTimeLeft(90);
      setPhase(PHASES.PLANNING);
    } catch (err) {
      throw err;
    }
  };

  const handleStationClick = (targetId) => {
    if (phase !== PHASES.PLANNING) return;

    const currentId = selectedRoute.length === 0 
      ? currentGame.start.id 
      : selectedRoute[selectedRoute.length - 1].s2_id;

    if (targetId === currentId) return;

    // Check for "Immediate Undo" (clicking back to the previous station)
    if (selectedRoute.length > 0) {
        const lastSegment = selectedRoute[selectedRoute.length - 1];
        if (targetId === lastSegment.s1_id) {
            undoLastStep();
            return;
        }
    }

    // Check for "Duplicate Link" anywhere else in the path
    const linkExists = selectedRoute.some(seg => 
        (seg.s1_id === currentId && seg.s2_id === targetId) ||
        (seg.s1_id === targetId && seg.s2_id === currentId)
    );
    if (linkExists) return;

    // Free routing: allow clicking any station
    const directedSegment = { s1_id: currentId, s2_id: targetId };
    setSelectedRoute([...selectedRoute, directedSegment]);
  };
  /**
   * Replicates server validation logic to find where the route breaks.
   * Returns animation steps ending at the failure point.
   */
  const calculateInvalidAnimationSteps = (route) => {
    const steps = [];
    const adj = {};

    // Build adjacency list from segments for local validation
    allSegments.forEach(seg => {
      if (!adj[seg.s1_id]) adj[seg.s1_id] = [];
      if (!adj[seg.s2_id]) adj[seg.s2_id] = [];
      adj[seg.s1_id].push({ to: seg.s2_id, lineId: seg.line_id });
      adj[seg.s2_id].push({ to: seg.s1_id, lineId: seg.line_id });
    });

    let currentLineId = null;
    let failed = false;

    for (let i = 0; i < route.length; i++) {
      const segment = route[i];

      // Find if segment exists in the actual network
      const availableLines = (adj[segment.s1_id] || [])
        .filter(n => n.to === segment.s2_id)
        .map(n => n.lineId);

      let event = { description: 'Station Reached', effect: 0 };

      if (availableLines.length === 0) {
        failed = true;
        event = { description: 'CRITICAL ERROR: NO TRACK DETECTED', effect: -20 };
      } else {
        // Re-use currentLineId if it's still valid for this segment
        if (currentLineId === null || !availableLines.includes(currentLineId)) {
          currentLineId = availableLines[0];
        }
      }

      steps.push({
        segment,
        event,
        coins: 0,
        isFailed: failed,
        lineId: failed ? null : currentLineId
      });
      if (failed) break;
    }

    return steps;
  };

  const submitRoute = async () => {
    clearTimeout(timerRef.current);
    try {
      const result = await api.post('/games/result', { route: selectedRoute });

      let finalResult;
      if (result.isInvalid) {
        // INVALID ROUTE — animate client-side steps so the character walks to the failure point
        const animationSteps = calculateInvalidAnimationSteps(selectedRoute);
        finalResult = {
          score: 0,
          steps: animationSteps,
          isInvalid: true,
          failReason: result.failReason || 'INVALID ROUTE'
        };
      } else {
        // VALID ROUTE — enrich server steps with lineId from local adjacency
        const enrichedSteps = calculateInvalidAnimationSteps(selectedRoute);
        const finalSteps = result.steps.map((s, i) => ({
          ...s,
          lineId: enrichedSteps[i]?.lineId,
          isFailed: false
        }));
        finalResult = { ...result, steps: finalSteps, isInvalid: false, failReason: null };
      }

      // Update data state first
      setGameResult(finalResult);
      setExecStep(0);
      setWalkProgress(0);

      // Then trigger animation phase
      setPhase(PHASES.EXECUTION);
    } catch (err) {

      if (err.status === 403) {
        setGameResult({ score: 0, steps: [], error: 'Time Expired!' });
        setPhase(PHASES.RESULT);
      } else {
        throw err;
      }
    }
  };


  const undoLastStep = () => {
    setSelectedRoute(prev => prev.slice(0, -1));
  };

  return {
    phase, setPhase,
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
    selectedCharacter,
    setSelectedCharacter
  };
}
