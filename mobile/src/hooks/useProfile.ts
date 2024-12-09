import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProfileService } from '../services/profile.service';
import type { Profile } from '../types/database';

export const useProfile = () => {
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: ProfileService.getProfile,
  });

  const updateProfile = useMutation({
    mutationFn: (data: Partial<Profile>) => ProfileService.upsertProfile(data),
    onSuccess: (newProfile) => {
      queryClient.setQueryData(['profile'], newProfile);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: ProfileService.uploadAvatar,
    onSuccess: (avatarUrl) => {
      // Update profile with new avatar URL
      updateProfile.mutate({ avatar_url: avatarUrl });
    },
  });

  return {
    profile,
    updateProfile,
    uploadAvatar,
  };
};
