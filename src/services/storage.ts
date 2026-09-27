import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Post } from '@/types';

const AUTH_TOKEN_KEY = '@splatt_space_auth_token';
const USER_DATA_KEY = '@splatt_space_user_data';
const USER_POSTS_KEY = '@splatt_space_user_posts';
const LIKES_STATE_KEY = '@splatt_space_likes_state';
const POST_COUNTS_KEY = '@splatt_space_post_counts'; // postId -> { likesCount, commentsCount }

export const StorageService = {
  async saveAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async saveUserData(userData: any): Promise<void> {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  },

  async saveUserPosts(posts: Post[]): Promise<void> {
    await AsyncStorage.setItem(USER_POSTS_KEY, JSON.stringify(posts));
  },

  async getUserPosts(): Promise<Post[]> {
    const data = await AsyncStorage.getItem(USER_POSTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addUserPost(post: Post): Promise<void> {
    const posts = await this.getUserPosts();
    posts.unshift(post);
    await this.saveUserPosts(posts);
  },

  // Like state per post (postId -> isLiked)
  async saveLikeState(postId: string, isLiked: boolean): Promise<void> {
    try {
      const likesState = await this.getLikesState();
      likesState[postId] = isLiked;
      await AsyncStorage.setItem(LIKES_STATE_KEY, JSON.stringify(likesState));
      console.log(`[Storage] Saved like state for post ${postId}:`, isLiked);
    } catch (error) {
      console.error(`[Storage] Failed to save like state for post ${postId}:`, error);
      throw error;
    }
  },

  // All like states
  async getLikesState(): Promise<Record<string, boolean>> {
    const data = await AsyncStorage.getItem(LIKES_STATE_KEY);
    return data ? JSON.parse(data) : {};
  },

  // Like state for one post
  async getLikeState(postId: string): Promise<boolean | null> {
    const likesState = await this.getLikesState();
    return likesState[postId] ?? null;
  },

  // Replace all like states
  async saveLikesState(likesState: Record<string, boolean>): Promise<void> {
    await AsyncStorage.setItem(LIKES_STATE_KEY, JSON.stringify(likesState));
  },

  // Counts per post (likesCount, commentsCount)
  async savePostCounts(postId: string, counts: { likesCount: number; commentsCount: number }): Promise<void> {
    try {
      const postCounts = await this.getPostCounts();
      postCounts[postId] = counts;
      await AsyncStorage.setItem(POST_COUNTS_KEY, JSON.stringify(postCounts));
      console.log(`[Storage] Saved counts for post ${postId}:`, counts);
    } catch (error) {
      console.error(`[Storage] Failed to save counts for post ${postId}:`, error);
      throw error;
    }
  },

  // All post counts
  async getPostCounts(): Promise<Record<string, { likesCount: number; commentsCount: number }>> {
    const data = await AsyncStorage.getItem(POST_COUNTS_KEY);
    return data ? JSON.parse(data) : {};
  },

  // Counts for one post
  async getPostCount(postId: string): Promise<{ likesCount: number; commentsCount: number } | null> {
    const postCounts = await this.getPostCounts();
    return postCounts[postId] ?? null;
  },

  // Repair inconsistent local state:
  // a post cannot be liked while its like count is 0
  async validateAndFixLikeState(): Promise<void> {
    try {
      const postCounts = await this.getPostCounts();
      const likesState = await this.getLikesState();
      let hasChanges = false;
      const fixedLikesState = { ...likesState };

      // Check every post
      for (const [postId, counts] of Object.entries(postCounts)) {
        const isLiked = likesState[postId];
        
        // Reset the like flag
        if (counts.likesCount === 0 && isLiked === true) {
          console.log(`[Storage] Fixing inconsistent like state for post ${postId}: likesCount=0 but isLiked=true`);
          fixedLikesState[postId] = false;
          hasChanges = true;
        }
      }

      // Persist only if something changed
      if (hasChanges) {
        await this.saveLikesState(fixedLikesState);
        console.log(`[Storage] Fixed ${Object.keys(fixedLikesState).filter(id => likesState[id] !== fixedLikesState[id]).length} inconsistent like states`);
      }
    } catch (error) {
      console.error('[Storage] Failed to validate and fix like state:', error);
    }
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, USER_POSTS_KEY, LIKES_STATE_KEY, POST_COUNTS_KEY]);
  },
};
