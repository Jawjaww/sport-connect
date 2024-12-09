import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple, Text, useTheme } from 'react-native-paper';

interface Position {
  id: string;
  name: string;
  x: number;
  y: number;
}

const positions: Position[] = [
  { id: 'gardien', name: 'Gardien', x: 50, y: 90 },
  { id: 'défenseur_gauche', name: 'Défenseur Gauche', x: 20, y: 70 },
  { id: 'défenseur_central', name: 'Défenseur Central', x: 50, y: 70 },
  { id: 'défenseur_droit', name: 'Défenseur Droit', x: 80, y: 70 },
  { id: 'milieu_gauche', name: 'Milieu Gauche', x: 20, y: 45 },
  { id: 'milieu_central', name: 'Milieu Central', x: 50, y: 45 },
  { id: 'milieu_droit', name: 'Milieu Droit', x: 80, y: 45 },
  { id: 'attaquant_gauche', name: 'Attaquant Gauche', x: 30, y: 20 },
  { id: 'attaquant', name: 'Attaquant', x: 50, y: 20 },
  { id: 'attaquant_droit', name: 'Attaquant Droit', x: 70, y: 20 },
];

interface PositionSelectorProps {
  value: string;
  onValueChange: (position: string) => void;
  error?: boolean;
}

const PositionSelector: React.FC<PositionSelectorProps> = ({
  value,
  onValueChange,
  error = false,
}) => {
  const theme = useTheme();

  const getMainPosition = (positionId: string): string => {
    if (positionId.includes('gardien')) return 'Gardien';
    if (positionId.includes('défenseur')) return 'Défenseur';
    if (positionId.includes('milieu')) return 'Milieu';
    if (positionId.includes('attaquant')) return 'Attaquant';
    return '';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.field, error && { borderColor: theme.colors.error }]}>
        <View style={styles.fieldLines}>
          <View style={styles.centerCircle} />
          <View style={styles.penaltyArea} />
          <View style={styles.penaltyArea2} />
        </View>
        {positions.map((position) => (
          <TouchableRipple
            key={position.id}
            onPress={() => onValueChange(position.id)}
            style={[
              styles.positionMarker,
              {
                left: `${position.x}%`,
                top: `${position.y}%`,
                backgroundColor: position.id === value ? theme.colors.primary : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: position.id === value ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
              }}
            >
              {position.name.split(' ')[0]}
            </Text>
          </TouchableRipple>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 2/3,
    position: 'relative',
    marginVertical: 16,
  },
  field: {
    width: '100%',
    height: 200,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    position: 'relative',
  },
  fieldLines: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fff',
  },
  centerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  penaltyArea: {
    width: 60,
    height: 100,
    borderWidth: 1,
    borderColor: '#fff',
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -50,
  },
  penaltyArea2: {
    width: 60,
    height: 100,
    borderWidth: 1,
    borderColor: '#fff',
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -50,
  },
  positionMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
});

export default PositionSelector;
