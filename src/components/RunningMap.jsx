import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation2, 
  Maximize2, 
  Minimize2, 
  Check,
  Satellite,
  Moon,
  Map as MapIcon,
  Mountain
} from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { getCoordinatesWithFallback } from '../utils/runningService';

// Provedores Globais de Mapas Ultrarrápidos, 100% Livres de Watermark e Chaves de API
const MAP_LAYERS = {
  'satellite': {
    id: 'satellite',
    name: 'Satélite HD',
    badge: 'Aéreo Real',
    icon: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: [],
    maxZoom: 19,
    attribution: '© ESRI World Imagery'
  },
  'strava-dark': {
    id: 'strava-dark',
    name: 'Strava Dark',
    badge: 'Noturno',
    icon: Moon,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    subdomains: [],
    maxZoom: 19,
    attribution: '© ESRI Dark Canvas'
  },
  'outdoor': {
    id: 'outdoor',
    name: 'Ruas & Parques',
    badge: 'Outdoor',
    icon: MapIcon,
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: [],
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  },
  'topography': {
    id: 'topography',
    name: 'Topografia',
    badge: 'Altimetria',
    icon: Mountain,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    subdomains: [],
    maxZoom: 18,
    attribution: '© ESRI World Topo'
  }
};

function RunningMapComponent({ 
  coordinates = [], 
  splits = [],
  currentPosition = null,
  isLive = true, 
  _isDark = true,
  height = '240px',
  routeColor = '#fc5200' // Strava Orange por padrão
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const casingPolylineRef = useRef(null);
  const corePolylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const startMarkerRef = useRef(null);
  const splitMarkersRef = useRef([]);
  const finishMarkerRef = useRef(null);
  const renderedCoordsCountRef = useRef(0);
  const renderedSplitsCountRef = useRef(-1);
  const hasCenteredOnUserRef = useRef(false);
  const animFrameRef = useRef(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [currentLayerId, setCurrentLayerId] = useState(() => {
    try {
      return localStorage.getItem('ab_fitness_map_layer') || 'satellite';
    } catch {
      return 'satellite';
    }
  });

  const activeLayer = MAP_LAYERS[currentLayerId] || MAP_LAYERS['satellite'];

  // Quando não estiver ao vivo (corrida finalizada ou histórico) e coordenadas forem insuficientes, usa circuito realista
  const effectiveCoordinates = (!isLive && (!coordinates || coordinates.length < 2))
    ? getCoordinatesWithFallback(coordinates)
    : coordinates;

  // Inicializar o Mapa Leaflet com proteção absoluta de ciclo de vida
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Prevenir erro crítico do Leaflet: "Map container is already initialized."
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    // Coordenada inicial: última posição da rota, ou fix atual do GPS (warm-up), ou Lisboa como fallback
    let initialPos = [38.7285, -9.1530];
    if (effectiveCoordinates.length > 0) {
      const last = effectiveCoordinates[effectiveCoordinates.length - 1];
      initialPos = [last.lat, last.lng];
      hasCenteredOnUserRef.current = true;
    } else if (currentPosition && typeof currentPosition.lat === 'number') {
      initialPos = [currentPosition.lat, currentPosition.lng];
      hasCenteredOnUserRef.current = true;
    }

    let map = null;
    try {
      map = L.map(container, {
        center: initialPos,
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Erro ao instanciar Leaflet map:', e);
      return;
    }

    // TileLayer com fallback automático garantido
    const createTileLayer = (layerDef) => {
      const opts = {
        maxZoom: layerDef.maxZoom || 19,
        crossOrigin: true
      };
      if (layerDef.subdomains && layerDef.subdomains.length > 0) {
        opts.subdomains = layerDef.subdomains;
      }
      const tl = L.tileLayer(layerDef.url, opts);
      tl.on('tileerror', () => {
        console.info('A carregar azulejo alternativo...');
      });
      return tl;
    };

    const tileLayer = createTileLayer(activeLayer).addTo(map);
    tileLayerRef.current = tileLayer;

    // 1. Linha Casing (Contorno escuro para garantir 100% contraste sobre qualquer mapa)
    const casingPolyline = L.polyline([], {
      color: '#000000',
      weight: 8,
      opacity: 0.75,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);
    casingPolylineRef.current = casingPolyline;

    // 2. Linha Principal (laranja de sinal)
    const corePolyline = L.polyline([], {
      color: routeColor,
      weight: 5,
      opacity: 0.98,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);
    corePolylineRef.current = corePolyline;

    // Evento de arrasto manual do utilizador pausa auto-follow
    map.on('dragstart', () => {
      if (hasCenteredOnUserRef.current) {
        setAutoFollow(false);
      }
    });

    // Invalidate size para garantir que os tiles cobrem 100% da área do container
    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);
    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 500);

    const handleResize = () => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (container) {
        container._leaflet_id = null;
      }
      renderedCoordsCountRef.current = 0;
      renderedSplitsCountRef.current = -1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Alternar Camada de Mapa
  const handleSelectLayer = (layerId) => {
    setCurrentLayerId(layerId);
    setShowLayerMenu(false);
    triggerHaptic(10);
    try {
      localStorage.setItem('ab_fitness_map_layer', layerId);
    } catch {}

    const map = mapInstanceRef.current;
    if (map && tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      const newLayer = MAP_LAYERS[layerId] || MAP_LAYERS['satellite'];
      const opts = {
        maxZoom: newLayer.maxZoom || 19,
        crossOrigin: true
      };
      if (newLayer.subdomains && newLayer.subdomains.length > 0) {
        opts.subdomains = newLayer.subdomains;
      }
      const newTileLayer = L.tileLayer(newLayer.url, opts).addTo(map);
      tileLayerRef.current = newTileLayer;
    }
  };

  // Função auxiliar para animar suavemente a transição do marcador do corredor
  const animateMarkerTo = (marker, targetLatLng, durationMs = 350) => {
    if (!marker) return;
    const startLatLng = marker.getLatLng();
    if (!startLatLng) {
      marker.setLatLng(targetLatLng);
      return;
    }

    const dLat = targetLatLng[0] - startLatLng.lat;
    const dLng = targetLatLng[1] - startLatLng.lng;
    // Se a distância for muito grande (> 200m) ou zero, posiciona diretamente sem interpolação
    if (Math.abs(dLat) + Math.abs(dLng) > 0.002 || (dLat === 0 && dLng === 0)) {
      marker.setLatLng(targetLatLng);
      return;
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const ease = 1 - Math.pow(1 - progress, 2); // easeOutQuad
      marker.setLatLng([
        startLatLng.lat + dLat * ease,
        startLatLng.lng + dLng * ease
      ]);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  // Atualizar Traçado e Marcador do Corredor (incremental e otimizado)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Caso ainda não haja pontos na rota mas exista currentPosition do pré-aquecimento GPS
    if (effectiveCoordinates.length === 0) {
      if (renderedCoordsCountRef.current > 0) {
        casingPolylineRef.current?.setLatLngs([]);
        corePolylineRef.current?.setLatLngs([]);
        renderedCoordsCountRef.current = 0;
      }
      if (isLive && currentPosition && typeof currentPosition.lat === 'number') {
        const pos = [currentPosition.lat, currentPosition.lng];
        if (!userMarkerRef.current) {
          const runnerIcon = L.divIcon({
            className: 'custom-runner-marker',
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="
                  position: absolute;
                  inset: -8px;
                  background-color: ${routeColor};
                  opacity: 0.35;
                  border-radius: 50%;
                  animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                  position: relative;
                  width: 22px;
                  height: 22px;
                  background-color: ${routeColor};
                  border: 3px solid #ffffff;
                  border-radius: 50%;
                  box-shadow: 0 0 16px ${routeColor};
                "></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          userMarkerRef.current = L.marker(pos, { icon: runnerIcon }).addTo(map);
        } else {
          animateMarkerTo(userMarkerRef.current, pos);
        }

        if (!hasCenteredOnUserRef.current || autoFollow) {
          map.setView(pos, Math.max(map.getZoom(), 16), { animate: hasCenteredOnUserRef.current });
          hasCenteredOnUserRef.current = true;
        }
      }
      return;
    }

    const latest = effectiveCoordinates[effectiveCoordinates.length - 1];
    const latestPos = [latest.lat, latest.lng];

    // Atualização incremental da Polyline em modo Live (evita recriar todo o array a cada ponto)
    if (
      isLive &&
      renderedCoordsCountRef.current > 0 &&
      effectiveCoordinates.length === renderedCoordsCountRef.current + 1
    ) {
      casingPolylineRef.current?.addLatLng(latestPos);
      corePolylineRef.current?.addLatLng(latestPos);
    } else {
      const latLngs = effectiveCoordinates.map((c) => [c.lat, c.lng]);
      casingPolylineRef.current?.setLatLngs(latLngs);
      if (corePolylineRef.current) {
        corePolylineRef.current.setLatLngs(latLngs);
        corePolylineRef.current.setStyle({ color: routeColor });
      }
    }
    renderedCoordsCountRef.current = effectiveCoordinates.length;

    // Marcador de Início (START Verde)
    if (effectiveCoordinates.length >= 1) {
      const startPos = [effectiveCoordinates[0].lat, effectiveCoordinates[0].lng];
      if (!startMarkerRef.current) {
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px; 
              height: 24px; 
              background: #10b981; 
              border: 3px solid #ffffff; 
              border-radius: 50%;
              box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);
              color: #ffffff;
              font-size: 10px;
              font-weight: 900;
            ">
              S
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        startMarkerRef.current = L.marker(startPos, { icon: startIcon }).addTo(map);
      } else {
        startMarkerRef.current.setLatLng(startPos);
      }
    }

    // Marcador do Corredor (Pulso Fluorescente + Halo de Precisão GPS) ou Chegada
    if (isLive) {
      if (!userMarkerRef.current) {
        const runnerIcon = L.divIcon({
          className: 'custom-runner-marker',
          html: `
            <div style="position: relative; width: 22px; height: 22px;">
              <div style="
                position: absolute;
                inset: -8px;
                background-color: ${routeColor};
                opacity: 0.35;
                border-radius: 50%;
                animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                position: relative;
                width: 22px;
                height: 22px;
                background-color: ${routeColor};
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 16px ${routeColor};
              "></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        userMarkerRef.current = L.marker(latestPos, { icon: runnerIcon }).addTo(map);
      } else {
        animateMarkerTo(userMarkerRef.current, latestPos);
      }

      // Halo de precisão (accuracy) discreto
      const accRadius = latest.accuracy || currentPosition?.accuracy || 0;
      if (accRadius > 3 && accRadius < 80) {
        if (!accuracyCircleRef.current) {
          accuracyCircleRef.current = L.circle(latestPos, {
            radius: accRadius,
            color: routeColor,
            weight: 1,
            opacity: 0.35,
            fillColor: routeColor,
            fillOpacity: 0.1
          }).addTo(map);
        } else {
          accuracyCircleRef.current.setLatLng(latestPos);
          accuracyCircleRef.current.setRadius(accRadius);
        }
      }

      // No primeiro ponto real recebido, faz setView direto para sair do fallback de Lisboa
      if (!hasCenteredOnUserRef.current) {
        map.setView(latestPos, 17, { animate: false });
        hasCenteredOnUserRef.current = true;
      } else if (autoFollow) {
        map.panTo(latestPos, { animate: true, duration: 0.45 });
      }
    } else {
      // Modo estático / finalizado: remove marcador ao vivo e halo
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
        accuracyCircleRef.current = null;
      }
      // Marcador de Fim / Chegada
      if (effectiveCoordinates.length > 1) {
        const finishPos = [latest.lat, latest.lng];
        if (!finishMarkerRef.current) {
          const finishIcon = L.divIcon({
            className: 'custom-finish-marker',
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 26px; 
                height: 26px; 
                background: #e11d48; 
                border: 3px solid #ffffff; 
                border-radius: 50%;
              ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/></svg>
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });
          finishMarkerRef.current = L.marker(finishPos, { icon: finishIcon }).addTo(map);
        } else {
          finishMarkerRef.current.setLatLng(finishPos);
        }
      }

      if (effectiveCoordinates.length > 1 && corePolylineRef.current) {
        try {
          const bounds = corePolylineRef.current.getBounds();
          if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [35, 35], maxZoom: 17 });
          }
        } catch {}
      }
    }
  }, [effectiveCoordinates, currentPosition, autoFollow, isLive, routeColor]);

  // Atualizar Marcadores de KM (Splits) apenas quando a lista de splits muda
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!splits || splits.length === 0) {
      if (splitMarkersRef.current.length > 0) {
        splitMarkersRef.current.forEach((m) => m.remove());
        splitMarkersRef.current = [];
      }
      renderedSplitsCountRef.current = 0;
      return;
    }

    if (isLive && splits.length === renderedSplitsCountRef.current) {
      return;
    }

    splitMarkersRef.current.forEach((m) => m.remove());
    splitMarkersRef.current = [];

    splits.forEach((s) => {
      // Usa coordenada interpolada exata do split (se disponível) ou fallback proporcional
      let splitLat = s.lat;
      let splitLng = s.lng;

      if ((typeof splitLat !== 'number' || typeof splitLng !== 'number') && effectiveCoordinates.length > 0) {
        const targetIndex = Math.min(
          effectiveCoordinates.length - 1,
          Math.floor((s.km / (splits[splits.length - 1]?.km || 1)) * (effectiveCoordinates.length - 1))
        );
        const fallbackCoord = effectiveCoordinates[targetIndex];
        if (fallbackCoord) {
          splitLat = fallbackCoord.lat;
          splitLng = fallbackCoord.lng;
        }
      }

      if (typeof splitLat === 'number' && typeof splitLng === 'number') {
        const splitIcon = L.divIcon({
          className: 'custom-split-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 22px;
              height: 22px;
              background-color: #000000;
              color: #ffffff;
              border: 2px solid ${routeColor};
              border-radius: 50%;
              font-family: ui-monospace, monospace;
              font-size: 11px;
              font-weight: 900;
              box-shadow: 0 2px 8px rgba(0,0,0,0.8);
            ">
              ${s.km}
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const m = L.marker([splitLat, splitLng], { icon: splitIcon })
          .bindTooltip(`KM ${s.km} • ${s.pace || s.paceStr}`, { direction: 'top', offset: [0, -10] })
          .addTo(map);
        splitMarkersRef.current.push(m);
      }
    });

    renderedSplitsCountRef.current = splits.length;
  }, [splits, effectiveCoordinates, isLive, routeColor]);

  // Recentralizar na posição atual
  const handleRecenter = () => {
    setAutoFollow(true);
    triggerHaptic(12);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (effectiveCoordinates.length > 0) {
      const latest = effectiveCoordinates[effectiveCoordinates.length - 1];
      map.setView([latest.lat, latest.lng], 17, { animate: true });
      hasCenteredOnUserRef.current = true;
    } else if (currentPosition && typeof currentPosition.lat === 'number') {
      map.setView([currentPosition.lat, currentPosition.lng], 17, { animate: true });
      hasCenteredOnUserRef.current = true;
    }
  };

  // Alternar ecrã inteiro
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
    triggerHaptic(15);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
  };

  return (
    <div 
      className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-3 z-50 h-auto' : ''
      }`}
      style={{ height: isExpanded ? 'calc(100vh - 24px)' : height }}
    >
      {/* Container Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-zinc-950" />

      {/* Badges Flutuantes do Strava HUD (Topo Esquerdo) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-white text-[11px] font-bold shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isLive ? 'GPS AO VIVO' : 'PERCURSO'}</span>
        </div>

        {/* Seletor de Camadas */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayerMenu((prev) => !prev);
              triggerHaptic(8);
            }}
            className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-white text-[11px] font-bold shadow-md hover:bg-black/90 active:scale-95 transition-all cursor-pointer"
            title="Alternar estilo do mapa"
          >
            <activeLayer.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="text-[11px] hidden sm:inline">{activeLayer.name}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-44 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-1.5 shadow-2xl z-50 animate-fadeIn space-y-1">
              <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                Camada do Mapa
              </div>
              {Object.values(MAP_LAYERS).map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => handleSelectLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    currentLayerId === layer.id 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <layer.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{layer.name}</span>
                  </div>
                  {currentLayerId === layer.id && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botões Flutuantes de Ação (Recentralizar e Expandir) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        <button
          onClick={handleRecenter}
          className={`h-9 px-2.5 rounded-full flex items-center justify-center gap-1.5 backdrop-blur-md border shadow-lg transition-transform active:scale-90 cursor-pointer ${
            autoFollow 
              ? 'w-9 px-0 bg-orange-500 text-white border-orange-400 shadow-orange-500/30' 
              : 'bg-black/85 text-amber-400 hover:text-white border-amber-500/40 animate-pulse'
          }`}
          title="Recentralizar no Corredor"
        >
          <Navigation2 className="w-4 h-4 fill-current rotate-45 shrink-0" />
          {!autoFollow && <span className="text-[11px] font-bold pr-1">Recentrar</span>}
        </button>

        <button
          onClick={toggleExpand}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-black/80 text-zinc-300 hover:text-white backdrop-blur-md border border-white/15 shadow-lg transition-transform active:scale-90 cursor-pointer"
          title={isExpanded ? 'Minimizar' : 'Expandir Mapa'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Selo Strava GPS Engine na parte inferior */}
      <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10 pointer-events-none">
        <span className="text-orange-400 font-black">STRAVA</span>
        <span>• AB GPS Engine (Kalman 2D)</span>
      </div>
    </div>
  );
}

const RunningMap = React.memo(RunningMapComponent);
export default RunningMap;
