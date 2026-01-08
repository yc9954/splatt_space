# TravelSpace 3D - React Native Travel SNS App

<div align="center">
  <h3>🌍 Share Your Journey in 3D</h3>
  <p>A modern travel social media app with 3D image upload capabilities</p>
</div>

## ✨ Features

- 🗺️ **Travel Feed** - Browse stunning travel posts from around the world
- 📸 **3D Image Upload** - Convert your travel photos into immersive 3D experiences
- 👤 **User Profiles** - Share your travel journey with followers
- 🎨 **Beautiful UI** - Modern, Instagram-inspired interface
- 📱 **Native Performance** - Built with React Native for smooth Android experience
- 🔐 **Secure Authentication** - Login with email or social accounts

## 🚀 Tech Stack

- **React Native 0.76.6** - Cross-platform mobile framework
- **TypeScript** - Type-safe code
- **React Navigation** - Navigation library
- **React Native Vector Icons** - Beautiful icons
- **React Native Image Picker** - Camera and gallery access
- **Axios** - HTTP client for API calls
- **Linear Gradient** - Beautiful gradient effects

## 📋 Prerequisites

- Node.js >= 18
- Android Studio with Android SDK
- JDK 17 or higher
- React Native CLI

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd -1-
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Android dependencies**
```bash
cd android
./gradlew clean
cd ..
```

4. **Start Metro bundler**
```bash
npm start
```

5. **Run on Android**
```bash
npm run android
```

## 📱 App Structure

```
src/
├── App.tsx                 # Root component
├── navigation/
│   └── MainNavigator.tsx   # Bottom tab navigation
├── screens/
│   ├── LoginScreen.tsx     # Login & authentication
│   ├── FeedScreen.tsx      # Main feed with posts
│   ├── CameraScreen.tsx    # 3D image upload
│   └── ProfileScreen.tsx   # User profile
└── services/
    └── api.ts              # API integration
```

## 🎨 Key Features

### 1. Login Screen
- Email/Password authentication
- Social login (Google, Apple)
- Beautiful gradient background
- Modern UI with icons

### 2. Feed Screen
- Instagram-style post cards
- 3D badge indicators
- Like, comment, share buttons
- Location tags
- Hashtag support

### 3. Camera/Upload Screen
- Take photo or choose from gallery
- **3D Conversion** - Convert regular photos to 3D
- Add caption, location, and hashtags
- Upload progress indicator
- Tips for best 3D results

### 4. Profile Screen
- User stats (posts, followers, following)
- Photo gallery grid
- Edit profile
- 3D gallery view

## 🔌 API Integration

### 3D Image Conversion

The app is designed to integrate with 3D generation APIs like:

1. **Luma AI** (https://lumalabs.ai/)
   - High-quality 3D generation from single images
   - Supports depth estimation and NeRF reconstruction

2. **Custom Depth Estimation**
   - MiDaS model for depth map generation
   - DPT (Dense Prediction Transformer)

### Configuration

Update `src/services/api.ts` with your API credentials:

```typescript
const API_BASE_URL = 'https://your-api.com';
const LUMA_API_KEY = 'your_luma_api_key';
```

### Available API Methods

```typescript
// Upload 3D post
upload3DImage({imageUri, caption, location, hashtags})

// Convert to 3D
convert3DImage(imageUri)

// Generate depth map
generateDepthMap(imageUri)

// Fetch feed
getFeedPosts(page, limit)

// User profile
getUserProfile(username)
```

## 🎯 Development Roadmap

- [x] Basic app structure
- [x] Login screen
- [x] Feed with posts
- [x] Profile screen
- [x] Image upload functionality
- [x] 3D conversion placeholder
- [ ] Real 3D API integration (Luma AI)
- [ ] 3D viewer component
- [ ] Comments feature
- [ ] Real-time notifications
- [ ] Search and explore
- [ ] Stories feature
- [ ] Direct messaging

## 🔐 Permissions

The app requires the following Android permissions:

- `CAMERA` - Take photos
- `READ_EXTERNAL_STORAGE` - Access gallery
- `WRITE_EXTERNAL_STORAGE` - Save photos
- `READ_MEDIA_IMAGES` - Android 13+ media access
- `INTERNET` - API calls

## 🎨 Design Credits

- Inspired by modern travel apps
- UI components based on Material Design
- Icons from Feather Icons
- Images from Unsplash

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

<div align="center">
  Made with ❤️ for travel enthusiasts
</div>