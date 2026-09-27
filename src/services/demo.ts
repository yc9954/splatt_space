import { SAMPLE_CAPTURES, SAMPLE_THUMBNAILS } from '@/constants/sampleScenes';
import type { Comment, CreatePostRequest, Post, User } from '@/types';

/**
 * In-memory backend used in demo mode (no Supabase credentials).
 * It mirrors the subset of SupabaseAPI that the app consumes so screens do
 * not need to know which backend they are talking to. State lives for the
 * lifetime of the JS runtime and resets on reload.
 */

const DEMO_USER_ID = 'demo-you';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

const users: User[] = [
  {
    id: DEMO_USER_ID,
    email: 'you@splatt.space',
    username: 'you',
    bio: 'Exploring the world one splat at a time.',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    followersCount: 128,
    followingCount: 87,
    postsCount: 2,
    createdAt: hoursAgo(24 * 90),
  },
  {
    id: 'demo-wanderlust',
    email: 'wanderlust@splatt.space',
    username: 'wanderlust_explorer',
    bio: 'Travel enthusiast | 3D content creator',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    followersCount: 2540,
    followingCount: 892,
    postsCount: 3,
    createdAt: hoursAgo(24 * 200),
  },
  {
    id: 'demo-mountain',
    email: 'mountain@splatt.space',
    username: 'mountain_lover',
    bio: 'Peaks, passes and Gaussian splats.',
    profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
    followersCount: 6120,
    followingCount: 310,
    postsCount: 2,
    createdAt: hoursAgo(24 * 400),
  },
  {
    id: 'demo-museum',
    email: 'museum@splatt.space',
    username: 'museum_walks',
    bio: 'Scanning sculptures so you can walk around them.',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    followersCount: 980,
    followingCount: 120,
    postsCount: 1,
    createdAt: hoursAgo(24 * 30),
  },
];

const byId = (id: string) => users.find((u) => u.id === id)!;

const posts: Post[] = [
  {
    id: 'p-1',
    userId: 'demo-mountain',
    user: byId('demo-mountain'),
    imageUrl: SAMPLE_THUMBNAILS.alps,
    image3dUrl: SAMPLE_CAPTURES.arosa,
    is3D: true,
    caption: 'Morning above Arosa. Drag to look around, pinch to fly closer.',
    location: 'Arosa, Switzerland',
    hashtags: ['SwissAlps', 'GaussianSplatting', 'Hiking'],
    likesCount: 3891,
    commentsCount: 2,
    isLiked: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'p-2',
    userId: 'demo-museum',
    user: byId('demo-museum'),
    imageUrl: SAMPLE_THUMBNAILS.sculpture,
    image3dUrl: SAMPLE_CAPTURES.sculpture,
    is3D: true,
    caption: 'Jules Desbois, captured in a single walk around the pedestal.',
    location: 'Paris, France',
    hashtags: ['Sculpture', 'Museum', '3DScan'],
    likesCount: 1204,
    commentsCount: 1,
    isLiked: true,
    createdAt: hoursAgo(5),
  },
  {
    id: 'p-3',
    userId: 'demo-wanderlust',
    user: byId('demo-wanderlust'),
    imageUrl: SAMPLE_THUMBNAILS.globe,
    image3dUrl: SAMPLE_CAPTURES.globe,
    is3D: true,
    caption: 'The WPU globe on campus. Splats make metal look right.',
    location: 'Cambridge, USA',
    hashtags: ['Campus', 'PublicArt'],
    likesCount: 856,
    commentsCount: 1,
    isLiked: false,
    createdAt: hoursAgo(9),
  },
  {
    id: 'p-4',
    userId: DEMO_USER_ID,
    user: byId(DEMO_USER_ID),
    imageUrl: SAMPLE_THUMBNAILS.dandelion,
    image3dUrl: SAMPLE_CAPTURES.dandelion,
    is3D: true,
    caption: 'Macro splat of a dandelion. Every seed is a cloud of Gaussians.',
    location: 'Zurich, Switzerland',
    hashtags: ['Macro', 'Nature'],
    likesCount: 412,
    commentsCount: 0,
    isLiked: false,
    createdAt: hoursAgo(26),
  },
  {
    id: 'p-5',
    userId: 'demo-wanderlust',
    user: byId('demo-wanderlust'),
    imageUrl: SAMPLE_THUMBNAILS.eiffel,
    image3dUrl: SAMPLE_CAPTURES.a,
    is3D: true,
    caption: 'The city of lights never disappoints. Sunset capture from the Trocadero.',
    location: 'Paris, France',
    hashtags: ['Paris', 'EiffelTower', 'Sunset'],
    likesCount: 2567,
    commentsCount: 1,
    isLiked: false,
    createdAt: hoursAgo(30),
  },
  {
    id: 'p-6',
    userId: DEMO_USER_ID,
    user: byId(DEMO_USER_ID),
    imageUrl: SAMPLE_THUMBNAILS.nebula,
    image3dUrl: SAMPLE_CAPTURES.nebula,
    is3D: true,
    caption: 'Not a travel spot, but a nebula rendered as a splat is too good not to share.',
    location: 'Deep space',
    hashtags: ['Space', 'Abstract'],
    likesCount: 1877,
    commentsCount: 0,
    isLiked: false,
    createdAt: hoursAgo(50),
  },
  {
    id: 'p-7',
    userId: 'demo-mountain',
    user: byId('demo-mountain'),
    imageUrl: SAMPLE_THUMBNAILS.santorini,
    image3dUrl: SAMPLE_CAPTURES.b,
    is3D: true,
    caption: 'Blue domes and white walls. Walk the terraces in 3D.',
    location: 'Santorini, Greece',
    hashtags: ['Santorini', 'Greece', 'Island'],
    likesCount: 3120,
    commentsCount: 0,
    isLiked: false,
    createdAt: hoursAgo(70),
  },
  {
    id: 'p-8',
    userId: 'demo-wanderlust',
    user: byId('demo-wanderlust'),
    imageUrl: SAMPLE_THUMBNAILS.tokyo,
    image3dUrl: SAMPLE_CAPTURES.c,
    is3D: true,
    caption: 'Tokyo Tower after the rain.',
    location: 'Tokyo, Japan',
    hashtags: ['Tokyo', 'Night', 'Cityscape'],
    likesCount: 990,
    commentsCount: 0,
    isLiked: false,
    createdAt: hoursAgo(96),
  },
];

const comments: Comment[] = [
  { id: 'c-1', postId: 'p-1', userId: 'demo-wanderlust', user: byId('demo-wanderlust'), content: 'The depth on the ridge line is unreal.', createdAt: hoursAgo(1) },
  { id: 'c-2', postId: 'p-1', userId: DEMO_USER_ID, user: byId(DEMO_USER_ID), content: 'Adding this to my summer list.', createdAt: hoursAgo(0.5) },
  { id: 'c-3', postId: 'p-2', userId: 'demo-mountain', user: byId('demo-mountain'), content: 'How long was the capture walk?', createdAt: hoursAgo(4) },
  { id: 'c-4', postId: 'p-3', userId: 'demo-museum', user: byId('demo-museum'), content: 'Reflections came out great.', createdAt: hoursAgo(8) },
  { id: 'c-5', postId: 'p-5', userId: 'demo-mountain', user: byId('demo-mountain'), content: 'Classic.', createdAt: hoursAgo(28) },
];

const likedByMe = new Set<string>(posts.filter((p) => p.isLiked).map((p) => p.id));
const following = new Set<string>(['demo-wanderlust', 'demo-mountain']);

let currentUser: User | null = null;
let idCounter = 100;

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function withLikeState(post: Post): Post {
  return clone({ ...post, isLiked: likedByMe.has(post.id) });
}

function requireUser(): User {
  if (!currentUser) throw new Error('Not authenticated');
  return currentUser;
}

export const DemoAPI = {
  isDemo: true as const,

  // ==================== Auth ====================

  setCurrentUser(user: User | null) {
    currentUser = user;
  },

  async signInWithEmail(email: string, _password: string): Promise<User> {
    await delay();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    currentUser = existing ?? users[0];
    return clone(currentUser);
  },

  async signUpWithEmail(email: string, _password: string, username: string): Promise<User> {
    await delay();
    const user: User = {
      id: `demo-${idCounter++}`,
      email,
      username,
      bio: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    currentUser = user;
    return clone(user);
  },

  async signOut() {
    currentUser = null;
  },

  // ==================== Profile ====================

  async getProfile(userId: string): Promise<User> {
    await delay();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return clone(user);
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    return clone(user);
  },

  // ==================== Posts ====================

  async getFeed(page = 1, limit = 20): Promise<Post[]> {
    await delay();
    const offset = (page - 1) * limit;
    return posts.slice(offset, offset + limit).map(withLikeState);
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    await delay();
    return posts.filter((p) => p.userId === userId).map(withLikeState);
  },

  async getPost(postId: string): Promise<Post> {
    await delay();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    return withLikeState(post);
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    await delay(300);
    const user = requireUser();
    const post: Post = {
      id: `p-${idCounter++}`,
      userId: user.id,
      user,
      imageUrl: data.imageUrl,
      image3dUrl: data.image3dUrl,
      is3D: data.is3D,
      caption: data.caption,
      location: data.location,
      hashtags: data.hashtags,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      editMetadata: data.editMetadata,
      createdAt: new Date().toISOString(),
    };
    posts.unshift(post);
    user.postsCount += 1;
    return clone(post);
  },

  async deletePost(postId: string) {
    await delay();
    const index = posts.findIndex((p) => p.id === postId);
    if (index >= 0) {
      const [removed] = posts.splice(index, 1);
      const owner = users.find((u) => u.id === removed.userId);
      if (owner) owner.postsCount = Math.max(0, owner.postsCount - 1);
    }
  },

  // ==================== Likes ====================

  async likePost(postId: string): Promise<Post> {
    await delay();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    if (!likedByMe.has(postId)) {
      likedByMe.add(postId);
      post.likesCount += 1;
    }
    return withLikeState(post);
  },

  async unlikePost(postId: string): Promise<Post> {
    await delay();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    if (likedByMe.has(postId)) {
      likedByMe.delete(postId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    }
    return withLikeState(post);
  },

  async getPostLikes(_postId: string): Promise<User[]> {
    await delay();
    return clone(users.slice(1, 3));
  },

  // ==================== Comments ====================

  async getPostComments(postId: string): Promise<Comment[]> {
    await delay();
    return clone(comments.filter((c) => c.postId === postId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async createComment(postId: string, text: string): Promise<{ comment: Comment; post: Post }> {
    await delay();
    const user = requireUser();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    const comment: Comment = {
      id: `c-${idCounter++}`,
      postId,
      userId: user.id,
      user,
      content: text,
      createdAt: new Date().toISOString(),
    };
    comments.push(comment);
    post.commentsCount += 1;
    return { comment: clone(comment), post: withLikeState(post) };
  },

  async deleteComment(commentId: string): Promise<Post> {
    await delay();
    const index = comments.findIndex((c) => c.id === commentId);
    if (index < 0) throw new Error('Comment not found');
    const [removed] = comments.splice(index, 1);
    const post = posts.find((p) => p.id === removed.postId)!;
    post.commentsCount = Math.max(0, post.commentsCount - 1);
    return withLikeState(post);
  },

  // ==================== Follows ====================

  async followUser(userId: string, _currentUserId: string) {
    await delay();
    if (!following.has(userId)) {
      following.add(userId);
      const target = users.find((u) => u.id === userId);
      if (target) target.followersCount += 1;
      if (currentUser) currentUser.followingCount += 1;
    }
  },

  async unfollowUser(userId: string, _currentUserId: string) {
    await delay();
    if (following.has(userId)) {
      following.delete(userId);
      const target = users.find((u) => u.id === userId);
      if (target) target.followersCount = Math.max(0, target.followersCount - 1);
      if (currentUser) currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
    }
  },

  async isFollowing(userId: string, _currentUserId: string): Promise<boolean> {
    await delay(50);
    return following.has(userId);
  },

  async getFollowers(userId: string): Promise<User[]> {
    await delay();
    return clone(users.filter((u) => u.id !== userId).slice(0, 3));
  },

  async getFollowing(userId: string): Promise<User[]> {
    await delay();
    if (userId === DEMO_USER_ID) return clone(users.filter((u) => following.has(u.id)));
    return clone(users.filter((u) => u.id !== userId).slice(0, 2));
  },
};
