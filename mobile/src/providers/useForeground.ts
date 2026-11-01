import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function useForeground() {
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [connected, setConnected] = useState(true);
  useEffect(() => {
    const lifecycle = AppState.addEventListener('change', state => setActive(state === 'active'));
    const stopNetwork = NetInfo.addEventListener(state => setConnected(state.isConnected !== false && state.isInternetReachable !== false));
    return () => { lifecycle.remove(); stopNetwork(); };
  }, []);
  return { active, connected, enabled: active && connected };
}
