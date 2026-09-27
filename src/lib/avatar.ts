import type { User } from '@/types';

/**
 * Resolve a profile image, falling back to a generated initials avatar so
 * that users without a photo still get a consistent, branded placeholder.
 */
export function avatarUrl(user?: Pick<User, 'username' | 'profileImage'> | null): string {
  if (user?.profileImage) return user.profileImage;
  const name = encodeURIComponent(user?.username || 'Splatt');
  return `https://ui-avatars.com/api/?name=${name}&background=4A90E2&color=ffffff&size=128&bold=true`;
}
