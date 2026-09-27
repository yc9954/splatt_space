import { useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';

import { UserListScreen } from '@/components/UserListScreen';
import { api } from '@/services/api';

export default function FollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useCallback(() => (id ? api.getFollowers(id) : Promise.resolve([])), [id]);
  return <UserListScreen title="Followers" emptyText="No followers yet" load={load} />;
}
