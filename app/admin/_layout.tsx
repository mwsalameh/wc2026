import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants/theme';

const ADMIN_UID = process.env.EXPO_PUBLIC_ADMIN_UID ?? '';

export default function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && (!ADMIN_UID || u.uid !== ADMIN_UID)) {
        // Non-admin account — eject before rendering anything.
        await signOut(auth);
        setError('Access denied.');
        setUser(null);
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!user) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={(v) => { setEmail(v); setError(''); }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={(v) => { setPassword(v); setError(''); }}
          secureTextEntry
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable
          style={[styles.btn, signingIn && styles.btnDisabled]}
          onPress={async () => {
            setError('');
            setSigningIn(true);
            try {
              const credential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
              );
              // Server returned a valid credential — now verify it is the admin UID.
              // This blocks any Firebase account that isn't the authorised admin,
              // even if someone registers a new account in the same project.
              if (ADMIN_UID && credential.user.uid !== ADMIN_UID) {
                await signOut(auth);
                setError('Access denied.');
                return;
              }
              // Success: onAuthStateChanged will set user and reveal the Stack.
            } catch (e: any) {
              const code: string = e.code ?? '';
              if (
                code.includes('invalid-credential') ||
                code.includes('wrong-password') ||
                code.includes('user-not-found')
              ) {
                setError('Incorrect credentials.');
              } else if (code.includes('too-many-requests')) {
                setError('Too many attempts. Try again later.');
              } else {
                setError('Sign in failed.');
              }
            } finally {
              setSigningIn(false);
            }
          }}
          disabled={signingIn}
        >
          <Text style={styles.btnText}>{signingIn ? '…' : 'Continue'}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: fontFamily.bodySemiBold },
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.body,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    color: colors.live,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.small,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.body,
  },
});
