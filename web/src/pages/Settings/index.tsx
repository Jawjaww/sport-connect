import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  FormGroup,
  Box,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import styles from './styles';

interface SettingsFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  language: string;
  notifications: boolean;
}

interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
}

const Settings: React.FC = () => {
  const { user } = useAuth() as AuthContextType;
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: 'fr',
    notifications: true,
  });

  const [passwordForm, setPasswordForm] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: 'fr',
    notifications: true,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSuccess('Avatar mis à jour avec succès');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement form submission logic
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.password,
      });

      if (error) throw error;

      setSuccess('Mot de passe mis à jour avec succès');
      setOpenPasswordDialog(false);
      setPasswordForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        language: 'fr',
        notifications: true,
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Container sx={styles.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="section" aria-label="Photo de profil">
        <Box sx={styles.avatarWrapper}>
          <Avatar
            src={user?.user_metadata?.avatar_url}
            alt="Photo de profil"
            sx={styles.avatar}
          />
          <Box
            component="input"
            type="file"
            accept="image/*"
            id="avatar-upload"
            onChange={handleAvatarUpload}
            sx={styles.hiddenInput}
            aria-label="Sélectionner une photo de profil"
          />
          <label htmlFor="avatar-upload">
            <IconButton
              component="span"
              sx={styles.uploadIconButton}
              aria-label="Modifier la photo de profil"
            >
              <PhotoCameraIcon />
            </IconButton>
          </label>
        </Box>
      </Box>

      <form onSubmit={handleSubmit} aria-label="Formulaire des paramètres">
        <Grid container spacing={3}>
          <Grid item xs={12} sx={styles.section}>
            <FormGroup role="group" aria-labelledby="personal-info-label">
              <FormLabel 
                component="legend" 
                sx={styles.label} 
                id="personal-info-label"
              >
                Informations personnelles
              </FormLabel>
              
              <FormControl sx={styles.formControl}>
                <InputLabel htmlFor="firstName" required>
                  Prénom
                </InputLabel>
                <TextField
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  aria-labelledby="personal-info-label"
                  aria-required="true"
                  placeholder="Votre prénom"
                  label="Prénom"
                />
              </FormControl>

              <FormControl sx={styles.formControl}>
                <InputLabel htmlFor="lastName" required>
                  Nom
                </InputLabel>
                <TextField
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  aria-labelledby="personal-info-label"
                  aria-required="true"
                  placeholder="Votre nom"
                  label="Nom"
                />
              </FormControl>
            </FormGroup>
          </Grid>

          <Grid item xs={12} sx={styles.section}>
            <FormGroup role="group" aria-labelledby="account-settings-label">
              <FormLabel 
                component="legend" 
                sx={styles.label} 
                id="account-settings-label"
              >
                Paramètres du compte
              </FormLabel>

              <FormControl sx={styles.formControl}>
                <InputLabel htmlFor="email" required>
                  Email
                </InputLabel>
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  aria-labelledby="account-settings-label"
                  aria-required="true"
                  placeholder="votre.email@exemple.com"
                  label="Email"
                />
              </FormControl>

              <FormControl sx={styles.formControl}>
                <InputLabel id="language-label">
                  Langue
                </InputLabel>
                <Select
                  labelId="language-label"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleSelectChange}
                  fullWidth
                  aria-labelledby="account-settings-label language-label"
                  label="Langue"
                >
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={styles.button}
              aria-label="Enregistrer les modifications"
            >
              Enregistrer les modifications
            </Button>
          </Grid>
        </Grid>
      </form>

      <Dialog 
        open={openPasswordDialog} 
        onClose={() => setOpenPasswordDialog(false)}
        aria-labelledby="password-dialog-title"
      >
        <DialogTitle id="password-dialog-title">
          Modifier le mot de passe
        </DialogTitle>
        <DialogContent sx={styles.dialogContent}>
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl sx={styles.formControl}>
                  <TextField
                    id="current-password"
                    label="Mot de passe actuel"
                    type="password"
                    value={passwordForm.password}
                    onChange={handlePasswordInputChange}
                    fullWidth
                    required
                    aria-required="true"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
