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

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(data.email);

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la réinitialisation');
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
        <View style={styles.form}>
          <Text variant="headlineMedium" style={styles.title}>
            Réinitialiser le mot de passe
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Entrez votre adresse email pour recevoir les instructions de
            réinitialisation de mot de passe.
          </Text>

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

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          {success && (
            <Text
              style={[styles.successText, { color: theme.colors.primary }]}
            >
              Les instructions de réinitialisation ont été envoyées à votre
              adresse email.
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Réinitialiser le mot de passe
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.textButton}
          >
            Retour à la connexion
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
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
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
  successText: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;
