import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '@services/supabase';
import { Tournament, Team, Match } from '@/types';

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
      id={`tournament-tabpanel-${index}`}
      aria-labelledby={`tournament-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TournamentPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [openTournamentDialog, setOpenTournamentDialog] = useState(false);
  const [openMatchDialog, setOpenMatchDialog] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    format: 'group_stage',
    max_participants: 16,
  });

  const [matchForm, setMatchForm] = useState({
    home_team: '',
    away_team: '',
    date: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreateTournament = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert([tournamentForm])
        .select()
        .single();

      if (error) throw error;

      setTournaments([...tournaments, data]);
      setOpenTournamentDialog(false);
      generateGroups(data);
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const generateGroups = async (tournament: Tournament) => {
    // Logique pour générer les groupes automatiquement
    const numberOfGroups = 4; // Pour un tournoi à 16 équipes
    const teamsPerGroup = tournament.max_participants / numberOfGroups;
    
    // Mélanger les équipes aléatoirement
    const shuffledTeams = teams
      .slice(0, tournament.max_participants)
      .sort(() => Math.random() - 0.5);

    // Créer les groupes
    const groups = [];
    for (let i = 0; i < numberOfGroups; i++) {
      const groupTeams = shuffledTeams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
      groups.push({
        name: `Groupe ${String.fromCharCode(65 + i)}`,
        teams: groupTeams,
        tournament_id: tournament.id,
      });
    }

    try {
      // Sauvegarder les groupes dans la base de données
      const { error } = await supabase
        .from('tournament_groups')
        .insert(groups);

      if (error) throw error;

      // Générer les matchs pour chaque groupe
      await generateGroupMatches(groups);
    } catch (error) {
      console.error('Error generating groups:', error);
    }
  };

  const generateGroupMatches = async (groups: any[]) => {
    const matches = [];

    for (const group of groups) {
      const teams = group.teams;
      // Générer tous les matchs possibles entre les équipes du groupe
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            home_team: teams[i].id,
            away_team: teams[j].id,
            group_id: group.id,
            status: 'scheduled',
          });
        }
      }
    }

    try {
      const { error } = await supabase
        .from('matches')
        .insert(matches);

      if (error) throw error;
    } catch (error) {
      console.error('Error generating matches:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return 'Phase de groupes';
      case 1:
        return 'Huitièmes de finale';
      case 2:
        return 'Quarts de finale';
      case 3:
        return 'Demi-finales';
      case 4:
        return 'Finale';
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Tournois</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setOpenTournamentDialog(true)}
            >
              Créer un tournoi
            </Button>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="En cours" />
            <Tab label="À venir" />
            <Tab label="Terminés" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {tournaments
              .filter(t => t.status === 'in_progress')
              .map(tournament => (
                <Card key={tournament.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{tournament.name}</Typography>
                    
                    <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
                      {['Groupes', '1/8', '1/4', '1/2', 'Finale'].map((label, index) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Typography variant="subtitle1" gutterBottom>
                      {getStepContent(activeStep)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Participants: {tournament.current_participants?.length || 0}/{tournament.max_participants}
                    </Typography>

                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Équipe</TableCell>
                            <TableCell align="center">J</TableCell>
                            <TableCell align="center">G</TableCell>
                            <TableCell align="center">N</TableCell>
                            <TableCell align="center">P</TableCell>
                            <TableCell align="center">Pts</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tournament.groups?.[0]?.teams.map((team: Team) => (
                            <TableRow key={team.id}>
                              <TableCell component="th" scope="row">
                                {team.name}
                              </TableCell>
                              <TableCell align="center">0</TableCell>
                              <TableCell align="center">0</TableCell>
                              <TableCell align="center">0</TableCell>
                              <TableCell align="center">0</TableCell>
                              <TableCell align="center">0</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Prochains matchs
                      </Typography>
                      <List>
                        {/* Liste des prochains matchs */}
                        <ListItem>
                          <ListItemText
                            primary="Équipe A vs Équipe B"
                            secondary="Demain à 15:00"
                          />
                          <ListItemSecondaryAction>
                            <Chip label="Groupe A" color="primary" />
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Tournois à venir */}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Tournois terminés */}
          </TabPanel>
        </Grid>
      </Grid>

      {/* Dialog Création Tournoi */}
      <Dialog
        open={openTournamentDialog}
        onClose={() => setOpenTournamentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Créer un nouveau tournoi
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du tournoi"
            fullWidth
            value={tournamentForm.name}
            onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date de début"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={tournamentForm.start_date}
            onChange={(e) => setTournamentForm({ ...tournamentForm, start_date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date de fin"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={tournamentForm.end_date}
            onChange={(e) => setTournamentForm({ ...tournamentForm, end_date: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Format</InputLabel>
            <Select
              value={tournamentForm.format}
              onChange={(e) => setTournamentForm({ ...tournamentForm, format: e.target.value })}
            >
              <MenuItem value="group_stage">Phase de groupes + Élimination directe</MenuItem>
              <MenuItem value="knockout">Élimination directe</MenuItem>
              <MenuItem value="league">Championnat</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Nombre maximum de participants"
            type="number"
            fullWidth
            value={tournamentForm.max_participants}
            onChange={(e) => setTournamentForm({ ...tournamentForm, max_participants: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTournamentDialog(false)}>Annuler</Button>
          <Button onClick={handleCreateTournament} variant="contained">
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentPage;
