import { useRef, useState, useEffect, useCallback } from 'react';
import { SimulationEngine } from '../simulation/SimulationEngine';
import type { SimulationParams, SimulationState } from '../types';
import { DEFAULT_PARAMS } from '../constants';

export function useSimulation(initialParams: SimulationParams = DEFAULT_PARAMS) {
  const engineRef = useRef<SimulationEngine>(new SimulationEngine(initialParams));
  const [state, setState] = useState<SimulationState>(engineRef.current.getState());
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastTime = 0;
    const loop = (timestamp: number) => {
      const delta = lastTime ? timestamp - lastTime : 0;
      lastTime = timestamp;
      if (!paused) {
        engineRef.current.update(delta);
        setState(engineRef.current.getState());
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);
  const reset = useCallback(() => {
    engineRef.current.reset();
    setState(engineRef.current.getState());
  }, []);
  const setParams = useCallback((p: Partial<SimulationParams>) => {
    engineRef.current.setParams(p);
  }, []);

  return {
    state,
    paused,
    pause,
    resume,
    reset,
    setParams,
    engine: engineRef,
  };
}
