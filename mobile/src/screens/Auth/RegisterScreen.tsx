import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .min(1, 'Le nom d\'utilisateur est requis'),
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .min(1, 'Le mot de passe est requis'),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise'),
  fullName: z.string()
    .min(1, 'Le nom complet est requis'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, supabase } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setLoading(true);

    try {
      const { error: signUpError } = await signUp(
        data.email,
        data.password
      );

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // Create profile after successful registration
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              username: data.username,
              full_name: data.fullName,
            },
          ]);

        if (profileError) {
          setError(profileError.message);
        } else {
          navigation.navigate('Login');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>
          Créer un compte
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Nom d'utilisateur"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.username}
                  mode="outlined"
                  style={styles.input}
                />
                {errors.username && (
                  <HelperText type="error">
                    {errors.username.message}
                  </HelperText>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Nom complet"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.fullName}
                  mode="outlined"
                  style={styles.input}
                />
                {errors.fullName && (
                  <HelperText type="error">
                    {errors.fullName.message}
                  </HelperText>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  mode="outlined"
                  style={styles.input}
                />
                {errors.email && (
                  <HelperText type="error">
                    {errors.email.message}
                  </HelperText>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Mot de passe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.password}
                  secureTextEntry
                  mode="outlined"
                  style={styles.input}
                />
                {errors.password && (
                  <HelperText type="error">
                    {errors.password.message}
                  </HelperText>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Confirmer le mot de passe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.confirmPassword}
                  secureTextEntry
                  mode="outlined"
                  style={styles.input}
                />
                {errors.confirmPassword && (
                  <HelperText type="error">
                    {errors.confirmPassword.message}
                  </HelperText>
                )}
              </>
            )}
          />

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            S'inscrire
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.textButton}
          >
            Déjà un compte ? Se connecter
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  textButton: {
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default RegisterScreen;
