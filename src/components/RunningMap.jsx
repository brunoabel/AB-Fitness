import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation2, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Map as MapIcon,
  Check,
  Compass
} from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

// Definição dos Provedores Oficiais de Mapas (Google Maps & Strava Dark)
export const MAP_LAYERS = {
  'google-hybrid': {
    id: 'google-hybrid',
    name: 'Google Satélite',
    badge: 'Satélite HD',
    icon: '🛰️',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '© Google Maps'
  },
  'google-roadmap': {
    id: 'google-roadmap',
    name: 'Google Ruas',
    badge: 'Google Maps',
    icon: '🗺️',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '© Google Maps'
  },
  'google-terrain': {
    id: 'google-terrain',
    name: 'Google Terreno',
    badge: 'Topografia',
    icon: '⛰️',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '© Google Maps'
  },
  'strava-dark': {
    id: 'strava-dark',
    name: 'Strava Dark',
    badge: 'Modo Noturno',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '© CartoDB • Strava Dark'
  }
};

export default function RunningMap({ 
  coordinates = [], 
  splits = [],
  isLive = true, 
  isDark = true,
  height = '240px',
  routeColor = '#38bdf8' // Strava Orange '#FC5200' ou Sky Cyan '#38bdf8'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const casingPolylineRef = useRef(null);
  const corePolylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const splitMarkersRef = useRef([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [currentLayerId, setCurrentLayerId] = useState(() => {
    try {
      return localStorage.getItem('ab_fitness_map_layer') || 'google-hybrid';
    } catch {
      return 'google-hybrid';
    }
  });

  const activeLayer = MAP_LAYERS[currentLayerId] || MAP_LAYERS['google-hybrid'];

  // Inicializar o Mapa Leaflet com Google Maps Tile Layer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Coordenada inicial padrão (Lisboa ou última posição do GPS)
    const initialPos = coordinates.length > 0 
      ? [coordinates[coordinates.length - 1].lat, coordinates[coordinates.length - 1].lng]
      : [38.7223, -9.1393];

    const map = L.map(mapContainerRef.current, {
      center: initialPos,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Adiciona o TileLayer do Google Maps selecionado
    const tileLayer = L.tileLayer(activeLayer.url, {
      maxZoom: activeLayer.maxZoom || 20,
      subdomains: activeLayer.subdomains || ['0', '1', '2', '3']
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // 1. Linha Casing (Sombra escura de alto contraste para visibilidade sobre satélite/ruas)
    const casingPolyline = L.polyline([], {
      color: '#000000',
      weight: 8,
      opacity: 0.65,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);
    casingPolylineRef.current = casingPolyline;

    // 2. Linha Principal (Strava Neon Trajectory)
    const corePolyline = L.polyline([], {
      color: routeColor,
      weight: 5,
      opacity: 0.98,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);
    corePolylineRef.current = corePolyline;

    // Evento de arrasto do usuário pausa o auto-follow temporariamente
    map.on('dragstart', () => {
      setAutoFollow(false);
    });

    // Invalida tamanho após render para garantir renderização perfeita
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Alternar Camada de Mapa (Google Satélite / Google Ruas / Google Terreno / Strava Dark)
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
      const newLayer = MAP_LAYERS[layerId];
      const newTileLayer = L.tileLayer(newLayer.url, {
        maxZoom: newLayer.maxZoom || 20,
        subdomains: newLayer.subdomains || ['0', '1', '2', '3']
      }).addTo(map);
      tileLayerRef.current = newTileLayer;
    }
  };

  // Atualizar pontos das Polylines, Marcadores de Início, Corredor e KM Milestones
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || coordinates.length === 0) return;

    const latLngs = coordinates.map(c => [c.lat, c.lng]);

    // Atualiza linha de contorno e linha principal
    if (casingPolylineRef.current) {
      casingPolylineRef.current.setLatLngs(latLngs);
    }
    if (corePolylineRef.current) {
      corePolylineRef.current.setLatLngs(latLngs);
      corePolylineRef.current.setStyle({ color: routeColor });
    }

    const latest = coordinates[coordinates.length - 1];
    const latestPos = [latest.lat, latest.lng];

    // Marcador de Início (START Verde com Pulso)
    if (coordinates.length >= 1 && !startMarkerRef.current) {
      const startPos = [coordinates[0].lat, coordinates[0].lng];
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px; 
            height: 22px; 
            background: linear-gradient(135deg, #10b981, #059669); 
            border: 2.5px solid #ffffff; 
            border-radius: 50%;
            box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);
            color: #ffffff;
            font-size: 9px;
            font-weight: 900;
          ">
            S
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      startMarkerRef.current = L.marker(startPos, { icon: startIcon }).addTo(map);
    }

    // Marcador do Corredor com Pulso Neon Dinâmico
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
      userMarkerRef.current.setLatLng(latestPos);
    }

    // Marcadores de KM (Splits no estilo Strava: 1, 2, 3...)
    if (splits && splits.length > 0) {
      // Remove marcadores anteriores
      splitMarkersRef.current.forEach(m => m.remove());
      splitMarkersRef.current = [];

      splits.forEach((s) => {
        // Encontra a coordenada aproximada do split
        const targetIndex = Math.min(
          coordinates.length - 1, 
          Math.floor((s.km / (splits[splits.length - 1]?.km || 1)) * (coordinates.length - 1))
        );
        const splitCoord = coordinates[targetIndex];
        if (splitCoord) {
          const splitIcon = L.divIcon({
            className: 'custom-split-marker',
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                background-color: #000000;
                color: #ffffff;
                border: 2px solid #38bdf8;
                border-radius: 50%;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 10px;
                font-weight: 900;
                box-shadow: 0 2px 8px rgba(0,0,0,0.8);
              ">
                ${s.km}
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const m = L.marker([splitCoord.lat, splitCoord.lng], { icon: splitIcon })
            .bindTooltip(`KM ${s.km} • ${s.pace}`, { direction: 'top', offset: [0, -10] })
            .addTo(map);
          splitMarkersRef.current.push(m);
        }
      });
    }

    // Se autoFollow ativo e sessão ao vivo, acompanha o corredor com suavidade
    if (autoFollow && isLive) {
      map.panTo(latestPos, { animate: true, duration: 0.5 });
    } else if (!isLive && coordinates.length > 1) {
      // Treino estático: enquadra perfeitamente todo o percurso
      try {
        map.fitBounds(corePolylineRef.current.getBounds(), { padding: [40, 40] });
      } catch {}
    }
  }, [coordinates, autoFollow, isLive, splits, routeColor]);

  // Função para recentralizar na posição do corredor
  const handleRecenter = () => {
    setAutoFollow(true);
    triggerHaptic(12);
    const map = mapInstanceRef.current;
    if (map && coordinates.length > 0) {
      const latest = coordinates[coordinates.length - 1];
      map.setView([latest.lat, latest.lng], 17, { animate: true });
    }
  };

  // Alternar visualização expandida / fullscreen
  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
    triggerHaptic(15);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
  };

  return (
    <div 
      className={`relative rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-3 z-50 h-auto' : ''
      }`}
      style={{ height: isExpanded ? 'calc(100vh - 24px)' : height }}
    >
      {/* Container Leaflet do Google Maps */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-zinc-950" />

      {/* Badges Flutuantes do Strava HUD (Topo Esquerdo) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-white text-[11px] font-bold shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isLive ? 'GPS AO VIVO' : 'PERCURSO'}</span>
        </div>

        {/* Seletor de Camadas Google Maps */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayerMenu(prev => !prev);
              triggerHaptic(8);
            }}
            className="flex items-center gap-1 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-white text-[11px] font-bold shadow-md hover:bg-black/90 active:scale-95 transition-all cursor-pointer"
            title="Alternar estilo do mapa"
          >
            <span>{activeLayer.icon}</span>
            <span className="text-[10px] hidden sm:inline">{activeLayer.name}</span>
          </button>

          {/* Menu Dropdown de Camadas */}
          {showLayerMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-44 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-1.5 shadow-2xl z-50 animate-fadeIn space-y-1">
              <div className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                Camada do Mapa
              </div>
              {Object.values(MAP_LAYERS).map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => handleSelectLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    currentLayerId === layer.id 
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{layer.icon}</span>
                    <span>{layer.name}</span>
                  </div>
                  {currentLayerId === layer.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botões Flutuantes de Ação (Recentralizar e Expandir) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg transition-transform active:scale-90 cursor-pointer ${
            autoFollow 
              ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/30' 
              : 'bg-black/75 text-zinc-300 hover:text-white border-white/15'
          }`}
          title="Recentralizar no Corredor"
        >
          <Navigation2 className="w-4 h-4 fill-current rotate-45" />
        </button>

        <button
          onClick={toggleExpand}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-black/75 text-zinc-300 hover:text-white backdrop-blur-md border border-white/15 shadow-lg transition-transform active:scale-90 cursor-pointer"
          title={isExpanded ? 'Minimizar' : 'Expandir Mapa'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Selo Google Maps Oficial na parte inferior */}
      <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1.5 text-[9px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10 pointer-events-none">
        <span className="text-sky-400 font-black">Google</span>
        <span>Maps • AB Running</span>
      </div>
    </div>
  );
}
