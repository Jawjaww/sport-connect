import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { RootStackScreenProps } from '../types/navigation';
import { MaterialIcons } from '@expo/vector-icons';

type Props = RootStackScreenProps<'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sport Connect</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('CreateTeam')}
        >
          <MaterialIcons name="add" size={32} color="#007AFF" />
          <Text style={styles.cardText}>Créer une équipe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('JoinTeam')}
        >
          <MaterialIcons name="group-add" size={32} color="#007AFF" />
          <Text style={styles.cardText}>Rejoindre une équipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    color: '#212529',
  },
});

export default HomeScreen;
