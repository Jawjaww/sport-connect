import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { AuthUser, AuthStackParamList } from '../../types/sharedTypes';
import { AuthStackScreenProps } from '../../types/navigationTypes';

type Props = AuthStackScreenProps<'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('LoginScreen - Attempting login with email:', email);
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) throw signInError;

      console.log('LoginScreen - Login successful, navigating to Home');
      // Redirect to main screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    } catch (err) {
      console.error('LoginScreen - Login error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          SportConnect
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Connectez-vous à votre équipe
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error && (
          <Animated.Text 
            style={[styles.errorText, { color: theme.colors.error }]}
            entering={FadeIn}
          >
            {error}
          </Animated.Text>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Se connecter
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.textButton}
        >
          Mot de passe oublié ?
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          style={styles.textButton}
        >
          Créer un compte
        </Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 48,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    marginBottom: 12,
    paddingVertical: 8,
  },
  textButton: {
    marginVertical: 4,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 12,
  },
});
