import { createContext, useContext } from 'react';
import type { Runtime } from '../platform/runtime';

export const RuntimeContext = createContext<Runtime | null>(null);
export function useRuntime() {
  const runtime = useContext(RuntimeContext);
  if (!runtime) throw new Error('Mobile runtime is unavailable.');
  return runtime;
}
