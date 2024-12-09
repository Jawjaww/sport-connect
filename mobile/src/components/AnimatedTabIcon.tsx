import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface AnimatedTabIconProps {
  name: string;
  focused: boolean;
  size?: number;
}

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  name,
  focused,
  size = 24,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2);
      rotation.value = withSpring(1);
    } else {
      scale.value = withSpring(1);
      rotation.value = withSpring(0);
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        {
          rotate: `${interpolate(rotation.value, [0, 1], [0, 360])}deg`,
        },
      ],
    };
  });

  return (
    <AnimatedIcon
      name={name}
      size={size}
      color={focused ? theme.colors.primary : theme.colors.outline}
      style={[styles.icon, animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
});

export default AnimatedTabIcon;
