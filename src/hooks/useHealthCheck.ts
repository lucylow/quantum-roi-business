import { useCallback, useState } from 'react';
import type { HealthState } from '../services/health';
import { checkApiHealth } from '../services/health';

export function useHealthCheck() {
  const [state, setState] = useState<HealthState | null>(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    if (busy) return state;
    setBusy(true);
    try {
      const next = await checkApiHealth();
      setState(next);
      return next;
    } finally {
      setBusy(false);
    }
  }, [busy, state]);

  return { state, busy, check };
}
