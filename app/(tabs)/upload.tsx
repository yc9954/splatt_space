import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LUMA_GALLERY, type SampleScene } from '@/constants/sampleScenes';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { config } from '@/lib/config';
import { kiriService } from '@/services/kiri';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 48) / 3;
const MAX_VIDEO_SECONDS = 180;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function OptionCard({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.optionCard, disabled && styles.disabled]} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <View style={styles.optionIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function UploadScreen() {
  const { user, isDemo } = useAuth();
  const [showLumaGallery, setShowLumaGallery] = useState(false);
  const [selectedScene, setSelectedScene] = useState<SampleScene | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const goToEditor = (params: Record<string, string>) => router.push({ pathname: '/edit-asset', params });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to pick a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      goToEditor({ imageUrl: result.assets[0].uri, isLuma: 'false' });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      goToEditor({ imageUrl: result.assets[0].uri, isLuma: 'false' });
    }
  };

  const recordCaptureVideo = async () => {
    if (!config.kiriApiKey) {
      Alert.alert(
        'KIRI Engine key required',
        'Video capture is processed by KIRI Engine. Add EXPO_PUBLIC_KIRI_API_KEY to your .env to enable it, or pick a Luma scene below to try the editor.'
      );
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to record a capture video.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], allowsEditing: false, quality: 0.8, videoMaxDuration: MAX_VIDEO_SECONDS });
      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      let seconds = asset.duration ?? 0;
      if (seconds > 1000) seconds /= 1000; // some platforms report milliseconds
      if (seconds > MAX_VIDEO_SECONDS) {
        Alert.alert('Video too long', 'Capture videos must be 3 minutes or shorter.');
        return;
      }

      setIsUploadingVideo(true);
      const upload = await kiriService.uploadVideo({ videoFile: asset.uri, fileFormat: 'glb', isMask: 1 }, user?.id);
      router.push({ pathname: '/kiri-processing', params: { serialize: upload.data.serialize, videoUri: asset.uri } });
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message || 'Could not send the video to KIRI Engine.');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const useSelectedScene = () => {
    if (!selectedScene) return;
    setShowLumaGallery(false);
    goToEditor({ imageUrl: selectedScene.thumbnail, captureUrl: selectedScene.captureUrl, isLuma: 'true', location: selectedScene.location });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New capture</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[...Colors.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="videocam" size={28} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>Turn a place into 3D</Text>
          <Text style={styles.heroText}>
            Walk slowly around your subject while recording. KIRI Engine turns the video into a Gaussian splat you can share.
          </Text>
          <TouchableOpacity style={styles.heroButton} onPress={recordCaptureVideo} disabled={isUploadingVideo} activeOpacity={0.9}>
            {isUploadingVideo ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <Ionicons name="radio-button-on" size={18} color={Colors.danger} />
                <Text style={styles.heroButtonText}>Record capture video</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.heroHint}>Up to 3 minutes. Processing takes a few minutes.</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Other ways to post</Text>
        <OptionCard icon="cube-outline" title="Pick a Luma scene" subtitle="Start from a public Gaussian-splat capture" onPress={() => setShowLumaGallery(true)} />
        <OptionCard icon="camera-outline" title="Take a photo" subtitle="Share a regular 2D photo" onPress={takePhoto} disabled={Platform.OS === 'web'} />
        <OptionCard icon="images-outline" title="Choose from gallery" subtitle="Pick an existing photo" onPress={pickImage} />

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Capture tips</Text>
          <Text style={styles.tip}>Keep the subject centred and circle it at a steady pace.</Text>
          <Text style={styles.tip}>Textured surfaces and even daylight give the sharpest splats.</Text>
          <Text style={styles.tip}>Avoid reflections, moving people and plain white walls.</Text>
        </View>

        {isDemo && (
          <Text style={styles.demoNote}>Demo mode: posts you create stay on this device until you reload.</Text>
        )}
      </ScrollView>

      <Modal visible={showLumaGallery} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLumaGallery(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Luma scenes</Text>
            <TouchableOpacity onPress={() => setShowLumaGallery(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Public Gaussian-splat captures you can edit and post right away.</Text>

          <FlatList
            data={LUMA_GALLERY}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.galleryGrid}
            renderItem={({ item }) => {
              const selected = selectedScene?.id === item.id;
              return (
                <TouchableOpacity style={styles.galleryItem} onPress={() => setSelectedScene(item)} activeOpacity={0.85}>
                  <Image source={{ uri: item.thumbnail }} style={styles.galleryImage} resizeMode="cover" />
                  <View style={[styles.galleryOverlay, selected && styles.galleryOverlaySelected]}>
                    {selected && <Ionicons name="checkmark-circle" size={30} color={Colors.primary} />}
                  </View>
                  <Text style={styles.galleryLabel} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.modalActions}>
            {selectedScene && (
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedTitle}>{selectedScene.name}</Text>
                <Text style={styles.selectedSubtitle}>{selectedScene.location}</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.primaryButton, !selectedScene && styles.primaryButtonDisabled]} onPress={useSelectedScene} disabled={!selectedScene}>
              <Text style={styles.primaryButtonText}>{selectedScene ? 'Continue to editor' : 'Select a scene'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  hero: {
    borderRadius: Radii.xl,
    padding: 22,
    gap: 10,
    marginBottom: 24,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.4,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  heroButton: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: Radii.md,
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  heroHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  disabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tips: {
    marginTop: 14,
    backgroundColor: '#F0F9FF',
    borderRadius: Radii.md,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: 6,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  tip: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  demoNote: {
    marginTop: 16,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  galleryGrid: {
    padding: 12,
  },
  galleryItem: {
    width: GRID_ITEM_SIZE,
    margin: 4,
  },
  galleryImage: {
    width: '100%',
    height: GRID_ITEM_SIZE,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceInset,
  },
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: GRID_ITEM_SIZE,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryOverlaySelected: {
    backgroundColor: 'rgba(74,144,226,0.2)',
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  galleryLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  selectedInfo: {},
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.borderStrong,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
