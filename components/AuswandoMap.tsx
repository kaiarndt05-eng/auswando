import { useRef, useEffect, useState } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';
import { CountryId } from '@/constants/theme';
import { buildGlobeHtml } from '@/constants/globeHtml';

/** Props for the AuswandoMap globe component. */
export type AuswandoMapProps = {
  /** Destination country (pt | es | ch). */
  country: CountryId;
  /** Route progress 0–1 (0 = Berlin, 1 = destination reached). */
  progress: number;
  /** Number of completed roadmap steps (used for milestone glow). */
  doneCount: number;
  /** Total number of free roadmap steps (milestone count). */
  totalFree: number;
};

export default function AuswandoMap({ country, progress, doneCount, totalFree }: AuswandoMapProps) {
  const ref = useRef<WebView>(null);
  const ready = useRef(false);

  // Build the initial HTML once — CDN URLs and JS are static.
  const [html] = useState(() =>
    buildGlobeHtml({ country, progress, doneCount, totalFree })
  );

  // After first load, push prop updates without reloading the page.
  useEffect(() => {
    if (!ready.current) return;
    const payload = JSON.stringify({ country, progress, doneCount, totalFree });
    ref.current?.injectJavaScript(`window.updateGlobe(${payload});true;`);
  }, [country, progress, doneCount, totalFree]);

  return (
    <View style={{ flex: 1, backgroundColor: '#050e1f' }}>
      <WebView
        ref={ref}
        source={{ html }}
        style={{ flex: 1, backgroundColor: '#050e1f' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onLoadEnd={() => { ready.current = true; }}
        // Required for external CDN resources
        mixedContentMode="always"
        allowsInlineMediaPlayback
      />
    </View>
  );
}
