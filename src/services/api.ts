import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API URL
const LUMA_API_KEY = 'your_luma_api_key_here'; // Replace with your Luma AI API key

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface UploadPostData {
  imageUri: string;
  caption: string;
  location: string;
  hashtags: string[];
}

/**
 * Upload a 3D image post
 */
export const upload3DImage = async (data: UploadPostData) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', {
      uri: data.imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    formData.append('caption', data.caption);
    formData.append('location', data.location);
    formData.append('hashtags', JSON.stringify(data.hashtags));
    formData.append('is3D', 'true');

    const response = await apiClient.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading 3D image:', error);
    throw error;
  }
};

/**
 * Convert image to 3D using Luma AI or similar service
 *
 * Integration options:
 * 1. Luma AI (https://lumalabs.ai/) - High quality 3D generation
 * 2. Depth estimation models (MiDaS, DPT)
 * 3. NeRF-based reconstruction
 */
export const convert3DImage = async (imageUri: string) => {
  try {
    // Example: Luma AI integration
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await axios.post(
      'https://api.lumalabs.ai/v1/generate-3d',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${LUMA_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 3D conversion can take longer
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error converting to 3D:', error);
    throw error;
  }
};

/**
 * Alternative: Depth estimation for 3D effect
 * Can be used with models like MiDaS for depth map generation
 */
export const generateDepthMap = async (imageUri: string) => {
  try {
    // This would typically call a depth estimation API
    // or run a local ML model
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await apiClient.post('/depth-estimation', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error generating depth map:', error);
    throw error;
  }
};

/**
 * Fetch user feed posts
 */
export const getFeedPosts = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiClient.get('/posts/feed', {
      params: {page, limit},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (username: string) => {
  try {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Like a post
 */
export const likePost = async (postId: number) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

/**
 * Add comment to a post
 */
export const addComment = async (postId: number, comment: string) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/comments`, {
      comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
