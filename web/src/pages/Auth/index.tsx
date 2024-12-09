import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import { useAuth } from '@hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Auth: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error: authError } = await (tab === 0
        ? signIn(email, password)
        : signUp(email, password));

      if (authError) {
        setError(authError.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            SportConnect
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="auth tabs"
              centered
            >
              <Tab label="Connexion" />
              <Tab label="Inscription" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <TabPanel value={tab} index={0}>
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Se connecter
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                S'inscrire
              </Button>
            </form>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Auth;
