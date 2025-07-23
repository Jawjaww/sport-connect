import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Card, useTheme } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeamStackParamList } from "../../types/navigationTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabase";
import { useTeams } from "../../hooks/useTeams";

type Props = NativeStackScreenProps<TeamStackParamList, "TeamSettings">;

export default function TeamSettingsScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { teamId } = route.params;
  const queryClient = useQueryClient();
  const { teams } = useTeams();
  const team = teams.find(t => t.id === teamId);

  const { data: teamData, isLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      navigation.navigate("TeamDetails", { teamId });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const handleDeleteTeam = () => {
    Alert.alert(
      "Supprimer l\"équipe",
      "Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => deleteTeamMutation.mutate(),
          style: "destructive",
        },
      ],
    );
  };

  if (isLoading || !team) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleLarge">Paramètres de l\"équipe {team.name}</Text>
          <Button 
            mode="contained"
            onPress={() => navigation.getParent()?.navigate("CreateTeam")}
            style={styles.button}
          >
            Créer une nouvelle équipe
          </Button>
          <Button 
            mode="contained"
            onPress={handleDeleteTeam}
            buttonColor={theme.colors.error}
            style={[styles.button, styles.deleteButton]}
          >
            Supprimer l\"équipe
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    margin: 16,
  },
  button: {
    marginTop: 16,
  },
  deleteButton: {
    marginTop: 8,
  },
});
