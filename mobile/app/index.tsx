import { ActivityIndicator, View } from 'react-native';
import { useRuntime } from '../src/providers/RuntimeContext';
import { useAuth } from '../src/providers/AuthProvider';
import { SignIn } from '../src/features/prototype/SignIn';
import { Workspace } from '../src/features/prototype/Workspace';
import { useColors } from '../src/components/primitives';

export default function Index() {
  const runtime = useRuntime();
  const auth = useAuth();
  const colors = useColors();
  if (auth.loading) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator accessibilityLabel="Restoring session" color={colors.brand} /></View>;
  return auth.userId ? <Workspace key={auth.userId} runtime={runtime} userId={auth.userId} /> : <SignIn environment={runtime.config.environment} />;
}
