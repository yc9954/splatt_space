import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import type { WebFrameHandle, WebFrameProps } from './WebFrame.types';

/**
 * Native implementation: a react-native-webview rendering inline HTML.
 * The web implementation lives in WebFrame.web.tsx and uses an iframe.
 */
export const WebFrame = forwardRef<WebFrameHandle, WebFrameProps>(function WebFrame(
  { html, style, onMessage, onLoadStart, onLoadEnd, onError, scrollEnabled = false },
  ref
) {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    injectJavaScript: (js: string) => {
      webViewRef.current?.injectJavaScript(`${js}\ntrue;`);
    },
  }));

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={scrollEnabled}
        bounces={false}
        onMessage={(event) => onMessage?.({ nativeEvent: { data: event.nativeEvent.data } })}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onError={(event) => onError?.(event.nativeEvent.description)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
