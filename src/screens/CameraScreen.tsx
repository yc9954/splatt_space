import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import {upload3DImage} from '../services/api';

export default function CameraScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [is3DProcessing, setIs3DProcessing] = useState(false);

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    });

    if (result.assets && result.assets[0].uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    });

    if (result.assets && result.assets[0].uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleConvertTo3D = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setIs3DProcessing(true);
    try {
      // TODO: Integrate with Luma AI API or similar 3D conversion service
      // This is a placeholder for 3D conversion
      // const result = await convert3DImage(selectedImage);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        '3D Conversion',
        'Your image has been converted to 3D! (Demo mode)',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to convert image to 3D');
    } finally {
      setIs3DProcessing(false);
    }
  };

  const handlePost = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image to post');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('No Caption', 'Please add a caption to your post');
      return;
    }

    setIsUploading(true);
    try {
      await upload3DImage({
        imageUri: selectedImage,
        caption: caption.trim(),
        location: location.trim(),
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
      });

      Alert.alert('Success', 'Your 3D travel photo has been posted!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedImage(null);
            setCaption('');
            setLocation('');
            setHashtags('');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(null);
            setCaption('');
            setLocation('');
            setHashtags('');
          }}>
          <Icon name="x" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New 3D Post</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!selectedImage || isUploading}>
          <Text
            style={[
              styles.postButton,
              (!selectedImage || isUploading) && styles.postButtonDisabled,
            ]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Image preview or selection */}
        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{uri: selectedImage}} style={styles.imagePreview} />
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleConvertTo3D}
                disabled={is3DProcessing}>
                {is3DProcessing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="box" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Convert to 3D</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.changeButton]}
                onPress={handleChooseFromGallery}>
                <Icon name="image" size={20} color="#4A90E2" />
                <Text style={styles.changeButtonText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.selectionContainer}>
            <Icon name="camera" size={80} color="#9CA3AF" />
            <Text style={styles.selectionTitle}>Share Your Travel in 3D</Text>
            <Text style={styles.selectionSubtitle}>
              Capture or select a photo to convert into an immersive 3D
              experience
            </Text>

            <View style={styles.selectionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleTakePhoto}>
                <Icon name="camera" size={24} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleChooseFromGallery}>
                <Icon name="image" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Post details form */}
        {selectedImage && (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Icon name="map-pin" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Add location"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="message-square" size={20} color="#6B7280" />
              <TextInput
                style={[styles.input, styles.captionInput]}
                placeholder="Write a caption..."
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="hash" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Add hashtags (e.g., #travel #3D)"
                value={hashtags}
                onChangeText={setHashtags}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* 3D Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 3D Conversion Tips</Text>
              <Text style={styles.tipsText}>
                • Use photos with clear depth and perspective
              </Text>
              <Text style={styles.tipsText}>
                • Landscapes and architecture work best
              </Text>
              <Text style={styles.tipsText}>
                • Avoid flat surfaces or plain backgrounds
              </Text>
              <Text style={styles.tipsText}>
                • Good lighting improves 3D quality
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.uploadingText}>Uploading your 3D post...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  postButtonDisabled: {
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  selectionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  selectionButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  imagePreviewContainer: {
    padding: 16,
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  captionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  tipsContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
});
