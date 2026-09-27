import type { StyleProp, ViewStyle } from 'react-native';

export interface WebFrameMessageEvent {
  nativeEvent: { data: string };
}

export interface WebFrameHandle {
  /** Run JavaScript inside the frame (mirrors WebView.injectJavaScript). */
  injectJavaScript: (js: string) => void;
}

export interface WebFrameProps {
  /** Full HTML document to render. */
  html: string;
  style?: StyleProp<ViewStyle>;
  onMessage?: (event: WebFrameMessageEvent) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (message: string) => void;
  scrollEnabled?: boolean;
}
