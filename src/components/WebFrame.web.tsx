import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { WebFrameHandle, WebFrameProps } from './WebFrame.types';

/**
 * Web implementation: an iframe with `srcdoc`. Because srcdoc frames share
 * the parent origin we can both evaluate scripts inside them and receive
 * messages from them, which keeps the page-side code identical to native.
 * A tiny shim maps `window.ReactNativeWebView.postMessage` onto
 * `window.parent.postMessage` so the HTML does not need to know where it runs.
 */
const SHIM =
  '<script>window.ReactNativeWebView={postMessage:function(m){window.parent.postMessage({__webframe:true,data:m},"*");}};</script>';

export const WebFrame = forwardRef<WebFrameHandle, WebFrameProps>(function WebFrame(
  { html, style, onMessage, onLoadStart, onLoadEnd, onError },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    injectJavaScript: (js: string) => {
      const frameWindow = iframeRef.current?.contentWindow as (Window & { eval: (code: string) => unknown }) | null;
      if (!frameWindow) return;
      try {
        frameWindow.eval(js);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : String(error));
      }
    },
  }));

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const payload = event.data;
      if (payload && typeof payload === 'object' && payload.__webframe) {
        onMessage?.({ nativeEvent: { data: String(payload.data) } });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  useEffect(() => {
    onLoadStart?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  const srcDoc = useMemo(
    () => (html.includes('<head>') ? html.replace('<head>', `<head>${SHIM}`) : SHIM + html),
    [html]
  );

  return (
    <View style={[styles.container, style]}>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        title="Splatt Space viewer"
        allow="fullscreen; xr-spatial-tracking; geolocation"
        onLoad={() => onLoadEnd?.()}
        style={frameStyle}
      />
    </View>
  );
});

const frameStyle: React.CSSProperties = {
  border: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  background: 'transparent',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
