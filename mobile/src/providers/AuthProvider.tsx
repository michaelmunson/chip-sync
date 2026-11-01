import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { fetchAuthSession, getCurrentUser, signIn, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthState { loading: boolean; userId?: string; error?: string }
interface AuthContextValue extends AuthState {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  restore(): Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Unable to reach authentication. Please retry.';

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ loading: true });
  const generation = useRef(0);
  const busy = useRef(false);
  const restore = useCallback(async () => {
    const request = ++generation.current;
    try {
      const session = await fetchAuthSession();
      const user = session.tokens ? await getCurrentUser() : undefined;
      if (generation.current === request) setState({ loading: false, userId: user?.userId });
    } catch (error) {
      if (generation.current === request) setState({ loading: false, error: errorText(error) });
    }
  }, []);
  useEffect(() => {
    void restore();
    const stop = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedOut' || payload.event === 'tokenRefresh_failure') {
        ++generation.current;
        setState({ loading: false });
      } else if (payload.event === 'signedIn') void restore();
    });
    return () => { ++generation.current; stop(); };
  }, [restore]);

  const login = async (email: string, password: string) => {
    if (busy.current) return;
    busy.current = true;
    setState({ loading: true });
    try {
      const result = await signIn({ username: email.trim(), password });
      if (!result.isSignedIn) throw new Error(`Sign-in requires ${result.nextStep.signInStep}. This prototype supports confirmed email/password accounts.`);
      await restore();
    } catch (error) { setState({ loading: false, error: errorText(error) }); }
    finally { busy.current = false; }
  };
  const logout = async () => {
    if (busy.current) return;
    busy.current = true;
    ++generation.current;
    // Unmount all account-specific data before starting remote sign-out.
    setState({ loading: true });
    try { await signOut(); setState({ loading: false }); }
    catch (error) { setState({ loading: false, error: errorText(error) }); }
    finally { busy.current = false; }
  };
  return <AuthContext.Provider value={{ ...state, login, logout, restore }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is required.');
  return value;
}
