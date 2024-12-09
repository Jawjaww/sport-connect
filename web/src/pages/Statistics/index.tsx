import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Tabs,
  Tab
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { supabase } from '../../services/supabase';
import type { Player } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Statistics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 0,
    comments: '',
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          stats:player_stats(*),
          ratings:player_ratings(*)
        `);

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedPlayer) return;

    try {
      const { error } = await supabase
        .from('player_ratings')
        .insert([
          {
            player_id: selectedPlayer.id,
            rating: ratingForm.rating,
            comments: ratingForm.comments,
          },
        ]);

      if (error) throw error;

      // Rafraîchir les données
      fetchPlayers();
      setOpenRatingDialog(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const calculatePerformanceScore = (player: Player) => {
    const stats = player.stats;
    if (!stats) return 0;
    
    // Calculate performance score based on various stats
    const goalsWeight = 2;
    const assistsWeight = 1;
    const minutesWeight = 0.01;
    const cardsWeight = -1;

    const score = 
      (stats.goals || 0) * goalsWeight +
      (stats.assists || 0) * assistsWeight +
      (stats.minutes_played || 0) * minutesWeight +
      ((stats.yellow_cards || 0) + (stats.red_cards || 0) * 2) * cardsWeight;

    // Normalize to 0-10 scale
    return Math.max(0, Math.min(10, score));
  };

  const getGamesPlayed = (player: Player) => {
    return player.stats?.games_played || 0;
  };

  const getPlayerPerformanceData = (player: Player): ChartData<"line", number[], string> => {
    if (!player) {
      return {
        labels: [],
        datasets: [{
          label: 'Performance Stats',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
    }

    const stats = player.stats;
    if (!stats) {
      return {
        labels: [],
        datasets: [{
          label: 'Performance Stats',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
    }

    const labels = ['Games', 'Goals', 'Assists', 'Minutes'];
    const data = [
      stats.games_played || 0,
      stats.goals || 0,
      stats.assists || 0,
      stats.minutes_played || 0
    ];

    return {
      labels,
      datasets: [{
        label: 'Performance Stats',
        data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
            <Tab label="Classement général" />
            <Tab label="Par poste" />
            <Tab label="Évolution" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Joueur</TableCell>
                    <TableCell>Poste</TableCell>
                    <TableCell align="center">Matchs joués</TableCell>
                    <TableCell align="center">Performance</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players
                    .sort((a, b) => (b.stats?.performance_score || 0) - (a.stats?.performance_score || 0))
                    .map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={player.avatar_url} sx={{ mr: 2 }} />
                            {player.username}
                          </Box>
                        </TableCell>
                        <TableCell>{player.position}</TableCell>
                        <TableCell align="center">{getGamesPlayed(player)}</TableCell>
                        <TableCell align="center">
                          {calculatePerformanceScore(player)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setOpenRatingDialog(true);
                            }}
                          >
                            Évaluer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance par poste
                    </Typography>
                    <Box height={400}>
                      <Line
                        data={getPlayerPerformanceData(selectedPlayer)}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 5,
                            },
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {selectedPlayer && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Évolution des performances de {selectedPlayer.username}
                  </Typography>
                  <Box height={400}>
                    <Line
                      data={getPlayerPerformanceData(selectedPlayer)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 5,
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}
          </TabPanel>
        </Grid>
      </Grid>

      {/* Dialog Évaluation */}
      <Dialog
        open={openRatingDialog}
        onClose={() => setOpenRatingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Évaluer {selectedPlayer?.username}
        </DialogTitle>
        <DialogContent>
          <Box my={2}>
            <Typography gutterBottom>Note</Typography>
            <Rating
              value={ratingForm.rating}
              precision={0.5}
              onChange={(_event, newValue) => {
                setRatingForm({ ...ratingForm, rating: newValue || 0 });
              }}
            />
          </Box>
          <TextField
            margin="dense"
            label="Commentaires"
            fullWidth
            multiline
            rows={4}
            value={ratingForm.comments}
            onChange={(e) => setRatingForm({ ...ratingForm, comments: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRatingDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmitRating} variant="contained">
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Statistics;
