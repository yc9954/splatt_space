import { useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';

import { UserListScreen } from '@/components/UserListScreen';
import { api } from '@/services/api';

export default function FollowingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useCallback(() => (id ? api.getFollowing(id) : Promise.resolve([])), [id]);
  return <UserListScreen title="Following" emptyText="Not following anyone yet" load={load} />;
}
