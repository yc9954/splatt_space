import type { SampleScene } from '@/constants/sampleScenes';

/**
 * MapLibre world map with a pin per 3D capture. Uses the public OpenStreetMap
 * raster tiles (no API key; keep usage light and attributed). Runs inside
 * WebFrame; messages back:
 *   { type: 'mapLoaded' } | { type: 'mapError', error } |
 *   { type: 'viewAsset', assetId, assetName, captureUrl }
 * and exposes window.searchLocation(q), window.getCurrentLocation(), window.centerMap().
 */
export function buildTravelMapHtml(scenes: SampleScene[]): string {
  const pins = scenes.map((s) => ({ id: s.id, name: s.name, location: s.location, lat: s.lat, lon: s.lon, captureUrl: s.captureUrl, thumbnail: s.thumbnail }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Splatt Space map</title>
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #F5F5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #map { width: 100%; height: 100%; }
    .maplibregl-popup-content { border-radius: 14px !important; padding: 0 !important; box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important; overflow: hidden; }
    .maplibregl-popup-close-button { color: #fff !important; font-size: 20px !important; padding: 2px 8px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.6); }
    .popup { width: 220px; }
    .popup img { width: 100%; height: 110px; object-fit: cover; display: block; }
    .popup .body { padding: 12px 14px 14px; }
    .popup h3 { font-size: 16px; font-weight: 600; color: #1F2937; margin-bottom: 2px; }
    .popup .loc { font-size: 12px; color: #6B7280; margin-bottom: 10px; }
    .popup button { width: 100%; background: #4A90E2; color: #fff; border: 0; border-radius: 10px; padding: 10px; font-weight: 600; font-size: 14px; cursor: pointer; }
    .popup button:active { background: #3B7BC8; }
    .pin { width: 16px; height: 16px; border-radius: 50%; background: #EF4444; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; }
    .maplibregl-ctrl-attrib { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var post = function (payload) {
      try { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(payload)); } catch (e) {}
    };
    var pins = ${JSON.stringify(pins)};
    var HOME = { center: [10, 20], zoom: 1.4 };

    var map = new maplibregl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 22 }]
      },
      center: HOME.center,
      zoom: HOME.zoom,
      minZoom: 1,
      maxZoom: 18,
      attributionControl: true
    });

    map.on('load', function () {
      pins.forEach(function (pin) {
        var el = document.createElement('div');
        el.className = 'pin';
        var content = document.createElement('div');
        content.className = 'popup';
        content.innerHTML =
          '<img src="' + pin.thumbnail + '" alt="" />' +
          '<div class="body"><h3>' + pin.name + '</h3><div class="loc">' + pin.location + '</div>' +
          '<button type="button">Open in 3D</button></div>';
        content.querySelector('button').addEventListener('click', function () {
          post({ type: 'viewAsset', assetId: pin.id, assetName: pin.name, captureUrl: pin.captureUrl });
        });
        var popup = new maplibregl.Popup({ offset: 18, closeButton: true, closeOnClick: true, maxWidth: '240px' }).setDOMContent(content);
        new maplibregl.Marker({ element: el }).setLngLat([pin.lon, pin.lat]).setPopup(popup).addTo(map);
      });
      post({ type: 'mapLoaded' });
    });

    map.on('error', function (e) {
      post({ type: 'mapError', error: (e && e.error && e.error.message) || 'Map error' });
    });

    window.searchLocation = function (query) {
      fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=1')
        .then(function (r) { return r.json(); })
        .then(function (results) {
          if (results && results.length) {
            map.flyTo({ center: [parseFloat(results[0].lon), parseFloat(results[0].lat)], zoom: 11, duration: 1200 });
          }
        })
        .catch(function () {});
    };

    window.getCurrentLocation = function () {
      if (!navigator.geolocation) { window.centerMap(); return; }
      navigator.geolocation.getCurrentPosition(
        function (pos) { map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 11, duration: 1200 }); },
        function () { window.centerMap(); }
      );
    };

    window.centerMap = function () {
      map.flyTo({ center: HOME.center, zoom: HOME.zoom, duration: 1000 });
    };
  </script>
</body>
</html>`;
}
