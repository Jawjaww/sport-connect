import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

interface TeamImagePickerProps {
  imageUri: string | null;
  onPickImage: () => void;
  style?: ViewStyle;
}

export const TeamImagePicker: React.FC<TeamImagePickerProps> = ({
  imageUri,
  onPickImage,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.imageContainer,
          { borderColor: theme.colors.outline },
          imageUri ? styles.hasImage : null,
        ]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <IconButton
            icon="camera"
            size={32}
            onPress={onPickImage}
            style={styles.cameraIcon}
          />
        )}
      </View>
      {imageUri && (
        <IconButton
          icon="pencil"
          size={20}
          onPress={onPickImage}
          style={styles.editButton}
          mode="contained-tonal"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  hasImage: {
    borderStyle: 'solid',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIcon: {
    margin: 0,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    margin: 0,
  },
});
