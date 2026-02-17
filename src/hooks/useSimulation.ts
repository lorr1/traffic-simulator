import { useRef, useState, useEffect, useCallback } from 'react';
import { SimulationEngine } from '../simulation/SimulationEngine';
import type { Incident } from '../simulation/incidents/Incident';
import type { SimulationParams, SimulationState, IncidentConfig } from '../types';
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

  const addIncident = useCallback((config: IncidentConfig) => {
    return engineRef.current.addIncident(config);
  }, []);

  const removeIncident = useCallback((id: number) => {
    engineRef.current.removeIncident(id);
  }, []);

  const getActiveIncidents = useCallback((): Incident[] => {
    return engineRef.current.incidentManager.getActiveIncidents();
  }, []);

  return {
    state,
    paused,
    pause,
    resume,
    reset,
    setParams,
    addIncident,
    removeIncident,
    getActiveIncidents,
    engine: engineRef,
  };
}
