import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { RouteCorridor, Landmark, RoadHazard } from '../types';
import { MapPin, Compass, Sparkles, Layers } from 'lucide-react';

interface MapContainerProps {
  corridor: RouteCorridor;
  landmarks: Landmark[];
  hazards: RoadHazard[];
  currentWaypointIndex: number;
  simulationProgress: number; // 0 to 1
  isSimulating: boolean;
  onSelectLandmark: (landmark: Landmark) => void;
  onSelectHazard: (hazard: RoadHazard) => void;
  hasValidKey: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  corridor,
  landmarks,
  hazards,
  currentWaypointIndex,
  simulationProgress,
  onSelectLandmark,
  onSelectHazard,
  hasValidKey,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulated vehicle position: straight-line interpolation between waypoint
  // coordinates, not snapped to actual roads. Fine for a scripted demo of a
  // seeded corridor; would need real routing (e.g. Directions API polyline
  // sampling) before this represents live, road-following driving.
  const waypoints = corridor.waypoints;
  const currentWp = waypoints[currentWaypointIndex] || waypoints[0];
  const nextWp = waypoints[Math.min(currentWaypointIndex + 1, waypoints.length - 1)];

  const vehicleLat = currentWp.lat + (nextWp.lat - currentWp.lat) * simulationProgress;
  const vehicleLng = currentWp.lng + (nextWp.lng - currentWp.lng) * simulationProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#EAEAE8';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const lats = waypoints.map((w) => w.lat);
    const lngs = waypoints.map((w) => w.lng);
    const minLat = Math.min(...lats) - 0.01;
    const maxLat = Math.max(...lats) + 0.01;
    const minLng = Math.min(...lngs) - 0.01;
    const maxLng = Math.max(...lngs) + 0.01;

    const toCanvasX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (width - 120) + 60;
    const toCanvasY = (lat: number) => height - (((lat - minLat) / (maxLat - minLat)) * (height - 120) + 60);

    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    waypoints.forEach((wp, idx) => {
      const x = toCanvasX(wp.lng);
      const y = toCanvasY(wp.lat);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 18;
    waypoints.forEach((wp, idx) => {
      const x = toCanvasX(wp.lng);
      const y = toCanvasY(wp.lat);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    hazards.forEach((hz) => {
      const hx = toCanvasX(hz.lng);
      const hy = toCanvasY(hz.lat);
      ctx.beginPath();
      ctx.arc(hx, hy, 16, 0, Math.PI * 2);
      ctx.fillStyle = hz.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, hy, 10, 0, Math.PI * 2);
      ctx.fillStyle = hz.severity === 'critical' ? '#dc2626' : '#d97706';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hz.category === 'market_day' ? '🛒' : hz.category === 'agbero_checkpoint' ? '🛑' : '⚠️', hx, hy);
    });

    landmarks.forEach((lm) => {
      const lx = toCanvasX(lm.lng);
      const ly = toCanvasY(lm.lat);
      ctx.beginPath();
      ctx.arc(lx, ly, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#171717';
      ctx.fill();
      ctx.fillStyle = '#171717';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lm.name.split(' ')[0], lx, ly + 18);
    });

    waypoints.forEach((wp, idx) => {
      const wx = toCanvasX(wp.lng);
      const wy = toCanvasY(wp.lat);
      ctx.beginPath();
      ctx.arc(wx, wy, 6, 0, Math.PI * 2);
      ctx.fillStyle = idx === currentWaypointIndex ? '#ef4444' : '#000000';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    const vx = toCanvasX(vehicleLng);
    const vy = toCanvasY(vehicleLat);
    ctx.beginPath();
    ctx.arc(vx, vy, 24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(vx, vy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚗', vx, vy);
  }, [corridor, landmarks, hazards, currentWaypointIndex, simulationProgress, vehicleLat, vehicleLng]);

  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] min-h-[480px] rounded-2xl overflow-hidden border border-neutral-200 bg-[#FAF9F6] shadow-sm flex flex-col">
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-200 shadow-sm flex items-center space-x-2 pointer-events-auto">
          <Compass className="w-4 h-4 text-black animate-spin-slow" />
          <span className="text-xs font-bold text-black">{corridor.name}</span>
          <span className="text-[10px] text-neutral-500 font-mono font-bold">({corridor.distanceKm} km)</span>
        </div>
        <div className="bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>{landmarks.length} Seeded Landmarks Active</span>
        </div>
      </div>

      {hasValidKey ? (
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={corridor.center}
            defaultZoom={corridor.zoom}
            mapId="NAIJANAV_MAP"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            className="w-full h-full"
          >
            <AdvancedMarker position={{ lat: vehicleLat, lng: vehicleLng }} title="Current Vehicle Position">
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 bg-black/20 rounded-full animate-ping absolute" />
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold shadow-xl border-2 border-white">
                  🚗
                </div>
              </div>
            </AdvancedMarker>

            {landmarks.map((lm) => (
              <AdvancedMarker key={lm.id} position={{ lat: lm.lat, lng: lm.lng }} onClick={() => onSelectLandmark(lm)}>
                <Pin background="#000000" glyphColor="#ffffff" borderColor="#333333" />
              </AdvancedMarker>
            ))}

            {hazards.map((hz) => (
              <AdvancedMarker key={hz.id} position={{ lat: hz.lat, lng: hz.lng }} onClick={() => onSelectHazard(hz)}>
                <Pin background={hz.severity === 'critical' ? '#ef4444' : '#f59e0b'} glyphColor="#000" />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      ) : (
        <div className="relative w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-neutral-200 text-xs text-neutral-800 space-y-1.5 shadow-md max-w-xs">
            <div className="font-extrabold text-black flex items-center space-x-1 uppercase text-[10px] tracking-wider">
              <Layers className="w-3.5 h-3.5 text-black" />
              <span>Map Overlay Legend</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-medium">
              <span className="w-3 h-3 rounded-full bg-black inline-block" />
              <span>Corridor Route Spine</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-medium">
              <span className="w-3 h-3 rounded-full bg-neutral-800 inline-block" />
              <span>Seeded Landmarks (Yellow Canopy / Mechanic)</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-medium">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span>Hazard Intelligence (Market / Agbero)</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#FAF9F6] border-t border-neutral-200 p-3 overflow-x-auto flex items-center space-x-3 z-20">
        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest whitespace-nowrap pl-2 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-black" />
          <span>Corridor Landmarks:</span>
        </span>
        {landmarks.map((lm) => (
          <button
            key={lm.id}
            onClick={() => onSelectLandmark(lm)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm group"
          >
            <span className="text-black font-bold group-hover:scale-110 transition-transform">📍</span>
            <span>{lm.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
