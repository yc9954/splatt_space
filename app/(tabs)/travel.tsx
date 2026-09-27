import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SplatViewer } from '@/components/SplatViewer';
import { TravelAIChatModal } from '@/components/TravelAIChatModal';
import { WebFrame } from '@/components/WebFrame';
import type { WebFrameHandle, WebFrameMessageEvent } from '@/components/WebFrame.types';
import { TRAVEL_SCENES, type SampleScene } from '@/constants/sampleScenes';
import { Colors, Radii, Shadows } from '@/constants/theme';
import { buildTravelMapHtml } from '@/lib/travelMapHtml';

export default function TravelScreen() {
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState<SampleScene | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const mapRef = useRef<WebFrameHandle>(null);

  const mapHtml = useMemo(() => buildTravelMapHtml(TRAVEL_SCENES), []);

  const handleMapMessage = useCallback((event: WebFrameMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapLoaded' || data.type === 'mapError') {
        setIsMapLoading(false);
      } else if (data.type === 'viewAsset') {
        const scene = TRAVEL_SCENES.find((s) => s.id === data.assetId);
        if (scene) setSelectedScene(scene);
      }
    } catch {
      // ignore non-JSON messages
    }
  }, []);

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    mapRef.current?.injectJavaScript(`window.searchLocation && window.searchLocation(${JSON.stringify(query)});`);
  };

  const handleLocate = () => {
    mapRef.current?.injectJavaScript('window.getCurrentLocation && window.getCurrentLocation();');
  };

  return (
    <View style={styles.container}>
      <WebFrame
        ref={mapRef}
        html={mapHtml}
        style={styles.map}
        onMessage={handleMapMessage}
        onLoadEnd={() => setTimeout(() => setIsMapLoading(false), 1500)}
      />

      {isMapLoading && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading map</Text>
        </View>
      )}

      <SafeAreaView edges={['top']} style={styles.searchContainer} pointerEvents="box-none">
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a place"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>{TRAVEL_SCENES.length} places with 3D captures</Text>
        </View>
      </SafeAreaView>

      <TouchableOpacity style={[styles.fab, styles.fabAI]} onPress={() => setShowAIChat(true)} activeOpacity={0.85}>
        <Ionicons name="sparkles" size={20} color={Colors.primary} />
        <Text style={styles.fabText}>Ask AI</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.fab, styles.fabLocate]} onPress={handleLocate} activeOpacity={0.85}>
        <Ionicons name="locate" size={22} color={Colors.text} />
      </TouchableOpacity>

      <TravelAIChatModal visible={showAIChat} onClose={() => setShowAIChat(false)} />

      <Modal visible={!!selectedScene} animationType="slide" onRequestClose={() => setSelectedScene(null)}>
        <View style={styles.modal}>
          <SafeAreaView edges={['top']} style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedScene(null)} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={26} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.modalTitles}>
              <Text style={styles.modalTitle}>{selectedScene?.name}</Text>
              <Text style={styles.modalSubtitle}>{selectedScene?.location} · sample Luma capture</Text>
            </View>
            <View style={{ width: 40 }} />
          </SafeAreaView>
          {selectedScene && <SplatViewer source={selectedScene.captureUrl} autoRotate autoRotateSpeed={1} style={styles.viewer} />}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    gap: 8,
  },
  searchBar: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    height: 46,
    ...Shadows.raised,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    ...Platform.select({ web: { outlineStyle: 'none' } as object }),
  },
  legend: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.raised,
  },
  fabAI: {
    bottom: 84,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
  },
  fabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  fabLocate: {
    bottom: 24,
    width: 48,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#0F172A',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitles: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
  },
  modalSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  viewer: {
    flex: 1,
  },
});
