import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SplatViewer } from '@/components/SplatViewer';
import type { WebFrameHandle } from '@/components/WebFrame.types';
import { Colors, Radii } from '@/constants/theme';
import type { TextPosition } from '@/lib/splatViewerHtml';
import { api } from '@/services/api';

const TEXT_COLORS = ['#ffffff', '#FBBF24', '#F472B6', '#60A5FA', '#34D399'];

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

/**
 * Post composer. For Gaussian-splat sources (Luma gallery or a finished
 * KIRI capture) it shows a live editable viewer: background removal via
 * semantic masks and a 3D text overlay, both applied inside the scene.
 */
export default function EditAssetScreen() {
  const params = useLocalSearchParams<{ imageUrl?: string; captureUrl?: string; isLuma?: string; isKiri?: string; location?: string }>();
  const viewerRef = useRef<WebFrameHandle>(null);

  const imageUrl = params.imageUrl || '';
  const captureUrl = params.captureUrl || '';
  const is3D = (params.isLuma === 'true' || params.isKiri === 'true') && !!captureUrl;

  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(params.location || '');
  const [hashtags, setHashtags] = useState('');
  const [removeBackground, setRemoveBackground] = useState(false);
  const [textOverlay, setTextOverlay] = useState('');
  const [appliedText, setAppliedText] = useState('');
  const [textPosition, setTextPosition] = useState<TextPosition>('center');
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [isUploading, setIsUploading] = useState(false);

  const toggleBackground = () => {
    viewerRef.current?.injectJavaScript('window.toggleBackground && window.toggleBackground();');
    setRemoveBackground((v) => !v);
  };

  const applyText = (text: string, position: TextPosition, color: string) => {
    viewerRef.current?.injectJavaScript(
      `window.updateTextOverlay && window.updateTextOverlay(${JSON.stringify(text)}, ${JSON.stringify(position)}, ${JSON.stringify(color)});`
    );
    setAppliedText(text);
  };

  const handlePost = async () => {
    if (!imageUrl && !captureUrl) {
      notify('Nothing to post', 'Pick a photo or a 3D scene first.');
      return;
    }
    if (!caption.trim()) {
      notify('Add a caption', 'A short caption helps people find your capture.');
      return;
    }
    setIsUploading(true);
    try {
      const tags = hashtags
        .split(/[\s,]+/)
        .map((tag) => tag.replace(/^#/, '').trim())
        .filter(Boolean);

      await api.createPost({
        imageUrl: imageUrl || captureUrl,
        image3dUrl: is3D ? captureUrl : undefined,
        is3D,
        caption: caption.trim(),
        location: location.trim() || undefined,
        hashtags: tags,
        editMetadata: is3D
          ? { textOverlay: appliedText || undefined, textPosition, textColor, removeBackground }
          : undefined,
      });
      router.replace('/(tabs)/feed');
    } catch (error: any) {
      notify('Upload failed', error?.message || 'Could not publish this post.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New post</Text>
        <TouchableOpacity onPress={handlePost} disabled={isUploading} hitSlop={8}>
          {isUploading ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.postAction}>Post</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.preview}>
          {is3D ? (
            <SplatViewer
              ref={viewerRef}
              source={captureUrl}
              autoRotate
              autoRotateSpeed={0.8}
              style={StyleSheet.absoluteFill}
            />
          ) : imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.previewEmpty}>
              <Ionicons name="image-outline" size={48} color={Colors.textMuted} />
            </View>
          )}
          {is3D && (
            <View style={styles.badge3D}>
              <Ionicons name="cube-outline" size={12} color={Colors.white} />
              <Text style={styles.badge3DText}>3D</Text>
            </View>
          )}
        </View>

        {is3D && (
          <View style={styles.tools}>
            <Text style={styles.sectionTitle}>Scene edits</Text>

            <TouchableOpacity style={[styles.toolRow, removeBackground && styles.toolRowActive]} onPress={toggleBackground} activeOpacity={0.85}>
              <View style={styles.toolIcon}>
                <Ionicons name="layers-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.toolText}>
                <Text style={styles.toolTitle}>{removeBackground ? 'Background removed' : 'Remove background'}</Text>
                <Text style={styles.toolSubtitle}>Keep only the foreground semantic layer</Text>
              </View>
              <Ionicons name={removeBackground ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={removeBackground ? Colors.primary : Colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.textTool}>
              <View style={styles.toolHeader}>
                <View style={styles.toolIcon}>
                  <Ionicons name="text-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.toolText}>
                  <Text style={styles.toolTitle}>3D text overlay</Text>
                  <Text style={styles.toolSubtitle}>Floats inside the scene</Text>
                </View>
              </View>
              <View style={styles.textInputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Say something about this place"
                  placeholderTextColor={Colors.textMuted}
                  value={textOverlay}
                  onChangeText={setTextOverlay}
                  maxLength={40}
                />
                <TouchableOpacity style={styles.applyButton} onPress={() => applyText(textOverlay.trim(), textPosition, textColor)}>
                  <Text style={styles.applyButtonText}>{appliedText && !textOverlay.trim() ? 'Clear' : 'Apply'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.segmentRow}>
                {(['top', 'center', 'bottom'] as const).map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[styles.segment, textPosition === pos && styles.segmentActive]}
                    onPress={() => {
                      setTextPosition(pos);
                      if (appliedText) applyText(appliedText, pos, textColor);
                    }}
                  >
                    <Text style={[styles.segmentText, textPosition === pos && styles.segmentTextActive]}>
                      {pos[0].toUpperCase() + pos.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.swatches}>
                  {TEXT_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.swatch, { backgroundColor: color }, textColor === color && styles.swatchActive]}
                      onPress={() => {
                        setTextColor(color);
                        if (appliedText) applyText(appliedText, textPosition, color);
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.inputRow}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color={Colors.textSecondary} />
            <TextInput style={[styles.input, styles.captionInput]} placeholder="Write a caption" placeholderTextColor={Colors.textMuted} value={caption} onChangeText={setCaption} multiline />
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
            <TextInput style={styles.input} placeholder="Add a location" placeholderTextColor={Colors.textMuted} value={location} onChangeText={setLocation} />
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="pricetag-outline" size={20} color={Colors.textSecondary} />
            <TextInput style={styles.input} placeholder="Hashtags, e.g. #alps #splat" placeholderTextColor={Colors.textMuted} value={hashtags} onChangeText={setHashtags} autoCapitalize="none" />
          </View>

          <TouchableOpacity style={[styles.primaryButton, isUploading && styles.disabled]} onPress={handlePost} disabled={isUploading} activeOpacity={0.9}>
            {isUploading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryButtonText}>Share capture</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  postAction: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  preview: {
    height: 380,
    backgroundColor: Colors.black,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceInset,
  },
  badge3D: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  badge3DText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tools: {
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
  },
  toolRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  toolSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  textTool: {
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    gap: 12,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: Colors.text,
  },
  applyButton: {
    backgroundColor: Colors.text,
    borderRadius: Radii.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  swatches: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 'auto',
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  form: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  captionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
