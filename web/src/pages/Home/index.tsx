import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '@hooks/useAuth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Ces données seront remplacées par des appels API réels
  const upcomingMatches = [
    {
      id: 1,
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      date: '2023-12-01',
      time: '14:00',
    },
    {
      id: 2,
      homeTeam: 'Team C',
      awayTeam: 'Team D',
      date: '2023-12-03',
      time: '16:30',
    },
  ];

  const activeTournaments = [
    {
      id: 1,
      name: 'Coupe d\'Afrique des quartiers',
      status: 'En cours',
      teams: 16,
    },
    {
      id: 2,
      name: 'Championnat local',
      status: 'Inscription',
      teams: 8,
    },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Section des matchs à venir */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Matchs à venir</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => navigate('/my-team')}
                >
                  Organiser un match
                </Button>
              </Box>
              <List>
                {upcomingMatches.map((match) => (
                  <ListItem key={match.id} divider>
                    <ListItemText
                      primary={`${match.homeTeam} vs ${match.awayTeam}`}
                      secondary={`${match.date} à ${match.time}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="details">
                        <ArrowForwardIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Section des tournois actifs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Tournois actifs</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => navigate('/tournaments')}
                >
                  Créer un tournoi
                </Button>
              </Box>
              <List>
                {activeTournaments.map((tournament) => (
                  <ListItem key={tournament.id} divider>
                    <ListItemText
                      primary={tournament.name}
                      secondary={`${tournament.status} - ${tournament.teams} équipes`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="details">
                        <ArrowForwardIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Section des statistiques rapides */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vos statistiques
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h4" align="center">
                    12
                  </Typography>
                  <Typography variant="body2" align="center" color="textSecondary">
                    Matchs joués
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h4" align="center">
                    8.5
                  </Typography>
                  <Typography variant="body2" align="center" color="textSecondary">
                    Note moyenne
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h4" align="center">
                    3
                  </Typography>
                  <Typography variant="body2" align="center" color="textSecondary">
                    Tournois participés
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
