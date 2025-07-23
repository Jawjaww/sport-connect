import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchDetails'>;

const MatchDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
    return (
        <View>
            <Text>Match Details</Text>
            {/* Add your component logic here */}
        </View>
    );
};

export default MatchDetailsScreen;
