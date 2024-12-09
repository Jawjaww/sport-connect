import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  number: string;
  birthDate: string;
}

interface Team {
  id: string;
  name: string;
  sport: string;
  division: string;
  players: Player[];
}

const MyTeam: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [openPlayerDialog, setOpenPlayerDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerForm, setPlayerForm] = useState<Omit<Player, 'id'>>({
    firstName: '',
    lastName: '',
    position: '',
    number: '',
    birthDate: '',
  });
  const [teamForm, setTeamForm] = useState<Omit<Team, 'id' | 'players'>>({
    name: '',
    sport: '',
    division: '',
  });

  const fetchTeam = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        const playersData = await supabase
          .from('players')
          .select('*')
          .eq('team_id', data.id);

        setTeam({
          ...data,
          players: playersData.data || [],
        });
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTeam();
    }
  }, [user, fetchTeam]);

  const handlePlayerFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeamForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPlayer = async () => {
    try {
      if (!team) return;

      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            ...playerForm,
            team_id: team.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTeam(prev => ({
        ...prev!,
        players: [...prev!.players, data],
      }));

      setOpenPlayerDialog(false);
      setPlayerForm({
        firstName: '',
        lastName: '',
        position: '',
        number: '',
        birthDate: '',
      });
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleEditPlayer = async () => {
    try {
      if (!editingPlayer || !team) return;

      const { data, error } = await supabase
        .from('players')
        .update({
          ...playerForm,
        })
        .eq('id', editingPlayer.id)
        .select()
        .single();

      if (error) throw error;

      setTeam(prev => ({
        ...prev!,
        players: prev!.players.map(p =>
          p.id === editingPlayer.id ? data : p
        ),
      }));

      setOpenPlayerDialog(false);
      setEditingPlayer(null);
      setPlayerForm({
        firstName: '',
        lastName: '',
        position: '',
        number: '',
        birthDate: '',
      });
    } catch (error) {
      console.error('Error editing player:', error);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      setTeam(prev => ({
        ...prev!,
        players: prev!.players.filter(p => p.id !== playerId),
      }));
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleCreateTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            ...teamForm,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTeam({
        ...data,
        players: [],
      });

      setOpenTeamDialog(false);
      setTeamForm({
        name: '',
        sport: '',
        division: '',
      });
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {team ? (
        <>
          <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {team.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {team.sport} - {team.division}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenPlayerDialog(true)}
              >
                Ajouter un joueur
              </Button>
            </Grid>
          </Grid>

          <List>
            {team.players.map(player => (
              <ListItem key={player.id}>
                <ListItemText
                  primary={`${player.firstName} ${player.lastName}`}
                  secondary={`${player.position} - #${player.number}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => {
                      setEditingPlayer(player);
                      setPlayerForm({
                        firstName: player.firstName,
                        lastName: player.lastName,
                        position: player.position,
                        number: player.number,
                        birthDate: player.birthDate,
                      });
                      setOpenPlayerDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeletePlayer(player.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Bienvenue dans Mon Équipe
            </Typography>
            <Typography color="text.secondary">
              Vous n'avez pas encore créé d'équipe. Commencez par créer votre première équipe !
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTeamDialog(true)}
            >
              Créer une équipe
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Player Dialog */}
      <Dialog open={openPlayerDialog} onClose={() => setOpenPlayerDialog(false)}>
        <DialogTitle>
          {editingPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="firstName"
            label="Prénom"
            type="text"
            fullWidth
            value={playerForm.firstName}
            onChange={handlePlayerFormChange}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Nom"
            type="text"
            fullWidth
            value={playerForm.lastName}
            onChange={handlePlayerFormChange}
          />
          <TextField
            margin="dense"
            name="position"
            label="Position"
            type="text"
            fullWidth
            value={playerForm.position}
            onChange={handlePlayerFormChange}
          />
          <TextField
            margin="dense"
            name="number"
            label="Numéro"
            type="text"
            fullWidth
            value={playerForm.number}
            onChange={handlePlayerFormChange}
          />
          <TextField
            margin="dense"
            name="birthDate"
            label="Date de naissance"
            type="date"
            fullWidth
            value={playerForm.birthDate}
            onChange={handlePlayerFormChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPlayerDialog(false)}>Annuler</Button>
          <Button
            onClick={editingPlayer ? handleEditPlayer : handleAddPlayer}
            variant="contained"
          >
            {editingPlayer ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Dialog */}
      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)}>
        <DialogTitle>Créer une équipe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nom de l'équipe"
            type="text"
            fullWidth
            value={teamForm.name}
            onChange={handleTeamFormChange}
          />
          <TextField
            margin="dense"
            name="sport"
            label="Sport"
            type="text"
            fullWidth
            value={teamForm.sport}
            onChange={handleTeamFormChange}
          />
          <TextField
            margin="dense"
            name="division"
            label="Division"
            type="text"
            fullWidth
            value={teamForm.division}
            onChange={handleTeamFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Annuler</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTeam;
