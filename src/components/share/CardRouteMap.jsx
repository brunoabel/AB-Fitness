import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { THEMES } from './themes';
import { getCoordinatesWithFallback } from '../../utils/runningService';

/**
 * Minimapa Leaflet estático para a pré-visualização do cartão de partilha da corrida.
 */
export default function CardRouteMap({ coordinates, themeId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const coords = getCoordinatesWithFallback(coordinates);
    const center = coords[Math.floor(coords.length / 2)] || { lat: 38.7285, lng: -9.1530 };

    const tileUrl = themeId === 'satellite-map'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    let map = null;
    try {
      map = L.map(container, {
        center: [center.lat, center.lng],
        zoom: 14,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Erro ao criar mapa no card:', e);
      return;
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      crossOrigin: true
    }).addTo(map);

    const latLngs = coords.map((c) => [c.lat, c.lng]);

    L.polyline(latLngs, {
      color: '#000000',
      weight: 7,
      opacity: 0.85,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);

    const lineColor = themeId === 'strava-orange' || themeId === 'satellite-map' ? THEMES[themeId].accent : '#ffffff';
    const poly = L.polyline(latLngs, {
      color: lineColor,
      weight: 4.5,
      opacity: 1,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);

    if (coords.length > 0) {
      const startPos = [coords[0].lat, coords[0].lng];
      const endPos = [coords[coords.length - 1].lat, coords[coords.length - 1].lng];

      L.marker(startPos, {
        icon: L.divIcon({
          className: 'card-start-pin',
          html: '<div style="width:14px;height:14px;background:#10b981;border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 0 10px #10b981;"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map);

      L.marker(endPos, {
        icon: L.divIcon({
          className: 'card-end-pin',
          html: `<div style="width:14px;height:14px;background:${lineColor};border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 0 10px ${lineColor};"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map);
    }

    try {
      const bounds = poly.getBounds();
      if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [16, 16], maxZoom: 16 });
      }
    } catch {}

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (container) {
        container._leaflet_id = null;
      }
    };
  }, [coordinates, themeId]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden bg-zinc-950" />;
}
