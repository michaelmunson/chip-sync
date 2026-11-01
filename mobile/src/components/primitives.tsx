import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, useColorScheme, type TextInputProps } from 'react-native';

// Values mirror src/css/tokens.css. Both applications keep platform-native styling.
export function useColors() {
  return useColorScheme() === 'dark'
    ? { background: '#0d1410', surface: '#151d18', ink: '#e9f0eb', muted: '#94a69b', brand: '#6cc496', onBrand: '#0c1a13', line: '#26332b', danger: '#ec8d8a', wood: '#e0a244' }
    : { background: '#f4f6f3', surface: '#ffffff', ink: '#16201a', muted: '#637268', brand: '#216849', onBrand: '#ffffff', line: '#e4e8e2', danger: '#b94a48', wood: '#d08a22' };
}
export function Button({ title, onPress, disabled = false }: { title: string; onPress(): void; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, { backgroundColor: colors.brand, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }]}>
    <Text style={{ color: colors.onBrand, fontWeight: '600' }}>{title}</Text>
  </Pressable>;
}
export function Input(props: TextInputProps) {
  const colors = useColors();
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, { color: colors.ink, borderColor: colors.line, backgroundColor: colors.surface }, props.style]} />;
}
export function Label({ children, error = false }: PropsWithChildren<{ error?: boolean }>) {
  const colors = useColors();
  return <Text accessibilityRole={error ? 'alert' : undefined} style={{ color: error ? colors.danger : colors.ink, lineHeight: 22 }}>{children}</Text>;
}
export function Card({ children }: PropsWithChildren) {
  const colors = useColors();
  return <View style={[styles.card, { backgroundColor: colors.surface }]}>{children}</View>;
}
const styles = StyleSheet.create({
  button: { minHeight: 44, padding: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 44 },
  card: { padding: 16, gap: 12, borderRadius: 14 },
});
