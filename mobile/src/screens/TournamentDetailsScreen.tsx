import React from 'react';
import { View, Text } from 'react-native';
import { RootStackScreenProps } from '../types/navigationTypes';

const TournamentDetailsScreen: React.FC<RootStackScreenProps<'TournamentDetails'>> = ({ route, navigation }) => {
    return (
        <View>
            <Text>Détails du tournoi</Text>
            <Text>Tournament Details</Text>
            {/* Add your component logic here */}
        </View>
    );
};

export default TournamentDetailsScreen;
