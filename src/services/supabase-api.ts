import { supabase } from '@/lib/supabase';
import type { Post, User, Comment, CreatePostRequest } from '@/types';

// User profile type from Supabase
interface SupabaseProfile {
  id: string;
  username: string;
  email: string;
  profile_image: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
}

// Post type from Supabase
interface SupabasePost {
  id: string;
  user_id: string;
  image_url: string;
  image_3d_url: string | null;
  is_3d: boolean;
  caption: string;
  location: string | null;
  hashtags: string[];
  likes_count: number;
  comments_count: number;
  edit_metadata: any;
  created_at: string;
  profiles: SupabaseProfile;
  user_liked?: boolean;
}

// Convert Supabase profile to User type
function convertProfile(profile: SupabaseProfile): User {
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    profileImage: profile.profile_image || undefined,
    bio: profile.bio || '',
    followersCount: profile.followers_count,
    followingCount: profile.following_count,
    postsCount: profile.posts_count,
    createdAt: profile.created_at,
  };
}

// Convert Supabase post to Post type
function convertPost(post: SupabasePost): Post {
  return {
    id: post.id,
    userId: post.user_id,
    user: convertProfile(post.profiles),
    imageUrl: post.image_url,
    image3dUrl: post.image_3d_url || undefined,
    is3D: post.is_3d,
    caption: post.caption,
    location: post.location || undefined,
    hashtags: post.hashtags || [],
    likesCount: post.likes_count,
    commentsCount: post.comments_count,
    isLiked: post.user_liked || false,
    editMetadata: post.edit_metadata || null,
    createdAt: post.created_at,
  };
}

export const SupabaseAPI = {
  // ==================== Auth ====================

  async signUpWithEmail(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // ==================== Profile ====================

  async getProfile(userId: string, _userMetadata?: unknown, retryCount = 0): Promise<User> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (!error && data) return convertProfile(data);

    // PGRST116 = no rows. The handle_new_user trigger may still be creating
    // the profile right after sign-up, so retry briefly before giving up.
    if (error?.code === 'PGRST116') {
      if (retryCount < 3) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (retryCount + 1)));
        return this.getProfile(userId, _userMetadata, retryCount + 1);
      }
      throw new Error('Profile not found. Make sure supabase/migrations/001_initial_schema.sql has been applied.');
    }

    const isNetworkError =
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('fetch failed') ||
      error?.message?.toLowerCase().includes('network') ||
      !error?.code;
    if (isNetworkError) {
      throw new Error('Could not reach Supabase while loading the profile. Check your connection and try again.');
    }

    throw error ?? new Error('Unknown error while fetching profile');
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        bio: updates.bio,
        profile_image: updates.profileImage,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return convertProfile(data);
  },

  // ==================== Posts ====================

  async getFeed(page: number = 1, limit: number = 20): Promise<Post[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      const isNetworkError =
        error.message?.includes('Network request failed') ||
        error.message?.includes('fetch failed') ||
        error.message?.toLowerCase().includes('network') ||
        !error.code;
      if (isNetworkError) {
        throw new Error('Could not reach Supabase. Check your connection, VPN or firewall and try again.');
      }
      if (error.message?.includes('Invalid API key') || error.code === 'PGRST301') {
        throw new Error('Supabase rejected the API key. Verify EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.');
      }
      throw error;
    }

    // Local like state answers first; only unknown posts hit the database.

    const { StorageService } = await import('./storage');
    const likesState = await StorageService.getLikesState();
    
    // Check if current user liked each post
    if (user) {
      const postIds = data.map(p => p.id);
      
      // Only ask the database about posts we have no local state for
      const postsToCheck = postIds.filter(id => likesState[id] === undefined);
      
      if (postsToCheck.length > 0) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postsToCheck);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        
        // Cache the database answer locally
        const newLikesState: Record<string, boolean> = {};
        postsToCheck.forEach(postId => {
          const isLiked = likedPostIds.has(postId);
          newLikesState[postId] = isLiked;
        });
        await StorageService.saveLikesState({ ...likesState, ...newLikesState });
      }

      return data.map(post => {
        const isLiked = likesState[post.id] ?? false;
        return convertPost({
          ...post,
          user_liked: isLiked,
        });
      });
    }

    return data.map(post => convertPost(post));
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Check if current user liked each post
    if (user) {
      const postIds = data.map(p => p.id);
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);

      return data.map(post => convertPost({
        ...post,
        user_liked: likedPostIds.has(post.id),
      }));
    }

    return data.map(post => convertPost(post));
  },

  async getPost(postId: string, forceRefreshLikeState: boolean = false): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (*)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;

    // Resolve like state
    let isLiked = false;
    
    if (user) {
      // Forced refresh always asks the database
      if (forceRefreshLikeState) {
        const { data: like } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .single();

        isLiked = !!like;
        // Cache the database answer locally
        const { StorageService } = await import('./storage');
        await StorageService.saveLikeState(postId, isLiked);
      } else {
        // Prefer local state
        const { StorageService } = await import('./storage');
        const cachedLikeState = await StorageService.getLikeState(postId);
        
        if (cachedLikeState === null) {
          // Unknown locally: ask the database
          const { data: like } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single();

          isLiked = !!like;
          // Cache the database answer locally
          await StorageService.saveLikeState(postId, isLiked);
        } else {
          // Use the cached value
          isLiked = cachedLikeState;
        }
      }
    }

    return convertPost({ ...data, user_liked: isLiked });
  },

  async createPost(postData: CreatePostRequest): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        image_url: postData.imageUrl,
        image_3d_url: postData.image3dUrl,
        is_3d: postData.is3D,
        caption: postData.caption,
        location: postData.location,
        hashtags: postData.hashtags,
        edit_metadata: postData.editMetadata,
      })
      .select(`
        *,
        profiles (*)
      `)
      .single();

    if (error) throw error;
    return convertPost(data);
  },

  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  // ==================== Likes ====================

  async likePost(postId: string, expectedPreviousCount?: number): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert the like
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    // 23505 = already liked; just return the current post
    if (error) {
      if (error.code === '23505') {
        // Already liked: return the post with refreshed like state
        return await this.getPost(postId, true);
      }
      throw error;
    }

    // The count is maintained by a trigger; poll briefly until it catches up
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      
      // Actual number of likes
      const { count: actualLikesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      // Denormalised counter on posts
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      
      // Trigger has caught up when both agree
      if (postData && actualLikesCount !== null && postData.likes_count === actualLikesCount) {
        
        return await this.getPost(postId, true);
      }
    }

    // Give up waiting and return the latest snapshot
    return await this.getPost(postId, true);
  },

  async unlikePost(postId: string, expectedPreviousCount?: number): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete the like
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    // Nothing to delete is not an error
    if (error) {
      
      return await this.getPost(postId, true);
    }

    // The count is maintained by a trigger; poll briefly until it catches up
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      
      // Actual number of likes
      const { count: actualLikesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      // Denormalised counter on posts
      const { data: postData } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      
      // Trigger has caught up when both agree
      if (postData && actualLikesCount !== null && postData.likes_count === actualLikesCount) {
        
        return await this.getPost(postId, true);
      }
    }

    // Give up waiting and return the latest snapshot
    return await this.getPost(postId, true);
  },

  async getPostLikes(postId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        profiles (*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(like => convertProfile(like.profiles as any));
  },

  // ==================== Comments ====================

  async getPostComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      user: convertProfile(comment.profiles as any),
      postId: comment.post_id,
      content: comment.text,
      createdAt: comment.created_at,
    }));
  },

  async createComment(postId: string, text: string): Promise<{ comment: Comment; post: Post }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert the comment
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        post_id: postId,
        text,
      })
      .select(`
        *,
        profiles (*)
      `)
      .single();

    if (error) throw error;

    const comment: Comment = {
      id: data.id,
      userId: data.user_id,
      user: convertProfile(data.profiles as any),
      postId: data.post_id,
      content: data.text,
      createdAt: data.created_at,
    };

    // The count is maintained by a trigger; poll briefly until it catches up
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      
      // Actual number of comments
      const { count: actualCommentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      // Denormalised counter on posts
      const { data: postData } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .single();
      
      // Trigger has caught up when both agree
      if (postData && actualCommentsCount !== null && postData.comments_count === actualCommentsCount) {
        
        const post = await this.getPost(postId);
        return { comment, post };
      }
    }

    // Give up waiting and return the latest snapshot
    const post = await this.getPost(postId);
    return { comment, post };
  },

  async deleteComment(commentId: string): Promise<Post> {
    // Need the post id before deleting
    const { data: commentData } = await supabase
      .from('comments')
      .select('post_id')
      .eq('id', commentId)
      .single();

    if (!commentData) throw new Error('Comment not found');

    const postId = commentData.post_id;

    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    // The count is maintained by a trigger; poll briefly until it catches up
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      
      // Actual number of comments
      const { count: actualCommentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      // Denormalised counter on posts
      const { data: postData } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .single();
      
      // Trigger has caught up when both agree
      if (postData && actualCommentsCount !== null && postData.comments_count === actualCommentsCount) {
        
        return await this.getPost(postId, false);
      }
    }

    // Give up waiting and return the latest snapshot
    return await this.getPost(postId, false);
  },

  // ==================== Follows ====================

  async followUser(userId: string, currentUserId: string) {
    if (!currentUserId) throw new Error('Not authenticated');
    if (currentUserId === userId) throw new Error('Cannot follow yourself');

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUserId,
        following_id: userId,
      });

    if (error) throw error;
  },

  async unfollowUser(userId: string, currentUserId: string) {
    if (!currentUserId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', userId);

    if (error) throw error;
  },

  async isFollowing(userId: string, currentUserId: string): Promise<boolean> {
    if (!currentUserId) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return !!data;
  },

  async getFollowers(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:follower_id (*)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(follow => convertProfile(follow.follower as any));
  },

  async getFollowing(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:following_id (*)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(follow => convertProfile(follow.following as any));
  },
};
