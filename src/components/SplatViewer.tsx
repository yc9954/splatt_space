import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { buildSplatViewerHtml, type SplatViewerOptions } from '@/lib/splatViewerHtml';

import { WebFrame } from './WebFrame';
import type { WebFrameHandle, WebFrameMessageEvent } from './WebFrame.types';

export interface SplatViewerProps extends SplatViewerOptions {
  style?: StyleProp<ViewStyle>;
  /** Hide the built-in spinner/error overlays (e.g. when the parent draws its own). */
  hideOverlays?: boolean;
  onLoaded?: () => void;
  onError?: (message: string) => void;
  /** Raw message hook for editable viewers (backgroundToggled, textUpdated, ...). */
  onMessage?: (message: Record<string, unknown>) => void;
}

/**
 * Renders a Luma Gaussian splat. Works on iOS, Android and web through the
 * platform-specific WebFrame. Expose a ref to call `injectJavaScript` for
 * the editable viewer (toggleBackground / updateTextOverlay).
 */
export const SplatViewer = forwardRef<WebFrameHandle, SplatViewerProps>(function SplatViewer(
  { style, hideOverlays = false, onLoaded, onError, onMessage, ...options },
  ref
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(
    () => buildSplatViewerHtml(options),
    // Re-render the page only when a rendering option actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.source,
      options.autoRotate,
      options.autoRotateSpeed,
      options.background,
      options.transparentBackground,
      options.removeBackground,
      options.textOverlay,
      options.textPosition,
      options.textColor,
      options.particleReveal,
      options.cameraDistance,
    ]
  );

  const handleMessage = useCallback(
    (event: WebFrameMessageEvent) => {
      let payload: Record<string, unknown> | null = null;
      try {
        payload = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }
      if (!payload) return;
      if (payload.type === 'splatLoaded') {
        setIsLoading(false);
        setError(null);
        onLoaded?.();
      } else if (payload.type === 'splatError') {
        setIsLoading(false);
        const message = typeof payload.error === 'string' ? payload.error : 'Failed to load 3D scene';
        setError(message);
        onError?.(message);
      }
      onMessage?.(payload);
    },
    [onLoaded, onError, onMessage]
  );

  return (
    <View style={[styles.container, style]}>
      <WebFrame ref={ref} html={html} style={styles.frame} onMessage={handleMessage} />
      {!hideOverlays && isLoading && !error && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.overlayText}>Loading 3D scene</Text>
        </View>
      )}
      {!hideOverlays && error && (
        <View style={styles.overlay} pointerEvents="none">
          <Ionicons name="alert-circle" size={40} color={Colors.danger} />
          <Text style={styles.overlayText}>Could not load this scene</Text>
          <Text style={styles.overlaySubtext}>{error}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    overflow: 'hidden',
  },
  frame: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  overlayText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  overlaySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
  },
});
