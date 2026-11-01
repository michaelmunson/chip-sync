import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Input, Label, useColors } from '../../components/primitives';
import { useAuth } from '../../providers/AuthProvider';

export function SignIn({ environment }: { environment: string }) {
  const { login, restore, loading, error } = useAuth();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <Card>
        <Label>Chip Sync · {environment}</Label>
        <Label>Sign in with an existing confirmed account.</Label>
        <Input accessibilityLabel="Email" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" editable={!loading} />
        <Input accessibilityLabel="Password" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" editable={!loading} />
        {error && <Label error>{error}</Label>}
        <Button title={loading ? 'Signing in…' : 'Sign in'} disabled={loading || !email.trim() || !password} onPress={() => {
          const submitted = password;
          setPassword('');
          void login(email, submitted);
        }} />
        {error && <Button title="Retry saved session" disabled={loading} onPress={() => void restore()} />}
      </Card>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ container: { flexGrow: 1, justifyContent: 'center', padding: 20 } });
