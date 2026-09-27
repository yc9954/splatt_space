import { isDemoMode } from '@/lib/config';
import type { Comment, CreatePostRequest, Post, User } from '@/types';

import { DemoAPI } from './demo';
import { StorageService } from './storage';
import { SupabaseAPI } from './supabase-api';

/**
 * The data operations every backend must provide. SupabaseAPI (real) and
 * DemoAPI (in-memory) both satisfy it; `api` below is the single entry
 * point screens use.
 */
export interface DataBackend {
  getProfile(userId: string, userMetadata?: unknown): Promise<User>;
  updateProfile(userId: string, updates: Partial<User>): Promise<User>;
  getFeed(page?: number, limit?: number): Promise<Post[]>;
  getUserPosts(userId: string): Promise<Post[]>;
  getPost(postId: string): Promise<Post>;
  createPost(data: CreatePostRequest): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  likePost(postId: string): Promise<Post>;
  unlikePost(postId: string): Promise<Post>;
  getPostLikes(postId: string): Promise<User[]>;
  getPostComments(postId: string): Promise<Comment[]>;
  createComment(postId: string, text: string): Promise<{ comment: Comment; post: Post }>;
  deleteComment(commentId: string): Promise<Post>;
  followUser(userId: string, currentUserId: string): Promise<void>;
  unfollowUser(userId: string, currentUserId: string): Promise<void>;
  isFollowing(userId: string, currentUserId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
}

const backend: DataBackend = isDemoMode ? DemoAPI : SupabaseAPI;

class ApiService {
  readonly isDemo = isDemoMode;

  // ==================== Posts ====================

  getFeed(page = 1, limit = 20): Promise<Post[]> {
    return backend.getFeed(page, limit);
  }

  getUserPosts(userId: string): Promise<Post[]> {
    return backend.getUserPosts(userId);
  }

  getPost(postId: string): Promise<Post> {
    return backend.getPost(postId);
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    const post = await backend.createPost(data);
    const userData = await StorageService.getUserData();
    if (userData) {
      userData.postsCount = (userData.postsCount || 0) + 1;
      await StorageService.saveUserData(userData);
    }
    return post;
  }

  async deletePost(postId: string): Promise<void> {
    await backend.deletePost(postId);
    const userData = await StorageService.getUserData();
    if (userData) {
      userData.postsCount = Math.max(0, (userData.postsCount || 1) - 1);
      await StorageService.saveUserData(userData);
    }
  }

  // ==================== Likes ====================

  likePost(postId: string): Promise<Post> {
    return backend.likePost(postId);
  }

  unlikePost(postId: string): Promise<Post> {
    return backend.unlikePost(postId);
  }

  getPostLikes(postId: string): Promise<User[]> {
    return backend.getPostLikes(postId);
  }

  // ==================== Comments ====================

  getComments(postId: string): Promise<Comment[]> {
    return backend.getPostComments(postId);
  }

  createComment(postId: string, content: string): Promise<{ comment: Comment; post: Post }> {
    return backend.createComment(postId, content);
  }

  deleteComment(commentId: string): Promise<Post> {
    return backend.deleteComment(commentId);
  }

  // ==================== Profile ====================

  getUserProfile(userId: string, userMetadata?: unknown): Promise<User> {
    return backend.getProfile(userId, userMetadata);
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const profile = await backend.updateProfile(userId, updates);
    const userData = await StorageService.getUserData();
    if (userData && userData.id === userId) {
      await StorageService.saveUserData(profile);
    }
    return profile;
  }

  // ==================== Follows ====================

  async followUser(userId: string, currentUserId: string): Promise<void> {
    await backend.followUser(userId, currentUserId);
    await this.refreshLocalProfile(currentUserId, +1);
  }

  async unfollowUser(userId: string, currentUserId: string): Promise<void> {
    await backend.unfollowUser(userId, currentUserId);
    await this.refreshLocalProfile(currentUserId, -1);
  }

  isFollowing(userId: string, currentUserId: string): Promise<boolean> {
    return backend.isFollowing(userId, currentUserId);
  }

  getFollowers(userId: string): Promise<User[]> {
    return backend.getFollowers(userId);
  }

  getFollowing(userId: string): Promise<User[]> {
    return backend.getFollowing(userId);
  }

  // ==================== Upload ====================

  async uploadImage(uri: string): Promise<string> {
    // Images are referenced by URI for now; a Supabase Storage upload can
    // be plugged in here without touching the screens.
    return uri;
  }

  /**
   * Database triggers keep follower counts in sync; re-read the profile so
   * the locally cached user reflects them, falling back to an optimistic
   * delta when the network call fails.
   */
  private async refreshLocalProfile(currentUserId: string, delta: number) {
    const userData = await StorageService.getUserData();
    if (!userData || userData.id !== currentUserId) return;
    try {
      const updated = await backend.getProfile(currentUserId);
      await StorageService.saveUserData(updated);
    } catch {
      userData.followingCount = Math.max(0, (userData.followingCount || 0) + delta);
      await StorageService.saveUserData(userData);
    }
  }
}

export const api = new ApiService();
