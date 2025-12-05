import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserProfileButtonProps {
  avatarUrl: string | null;
  avatarError: boolean;
  userName: string;
  userLevel: number;
  onPress: () => void;
  onAvatarError: () => void;
  onAvatarLoad: () => void;
  primaryColor: string;
  textColor: string;
  secondaryTextColor: string;
}

export default function UserProfileButton({
  avatarUrl,
  avatarError,
  userName,
  userLevel,
  onPress,
  onAvatarError,
  onAvatarLoad,
  primaryColor,
  textColor,
  secondaryTextColor,
}: UserProfileButtonProps) {
  return (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Perfil de ${userName}, nível ${userLevel}`}
      accessibilityHint="Toque duas vezes para abrir seu perfil"
    >
      {avatarUrl && !avatarError ? (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
          onError={onAvatarError}
          onLoad={onAvatarLoad}
          accessible={false}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {userName}
        </Text>
        <Text style={[styles.level, { color: secondaryTextColor }]}>
          Level {userLevel}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  level: {
    fontSize: 13,
  },
});

