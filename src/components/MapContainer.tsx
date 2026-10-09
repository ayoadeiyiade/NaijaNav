import React, { useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { RouteCorridor, Landmark, RoadHazard } from '../types';
import { MapPin, Compass, Sparkles } from 'lucide-react';

interface MapContainerProps {
  corridor: RouteCorridor;
  landmarks: Landmark[];
  hazards: RoadHazard[];
  currentWaypointIndex: number;
  simulationProgress: number; // 0 to 1
  isSimulating: boolean;
  onSelectLandmark: (landmark: Landmark) => void;
  onSelectHazard: (hazard: RoadHazard) => void;
}

/**
 * Small DOM-based marker icons instead of Leaflet's default image markers.
 * Leaflet's default marker images don't resolve correctly under Vite's
 * bundling without extra asset-path config, and a plain colored div is
 * simpler and matches the app's black/white visual style anyway.
 */
function dotIcon(bg: string, size: number, glyph?: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;background:${bg};
      border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.floor(size * 0.55)}px;line-height:1;
    ">${glyph || ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const MapContainer: React.FC<MapContainerProps> = ({
  corridor,
  landmarks,
  hazards,
  currentWaypointIndex,
  simulationProgress,
  onSelectLandmark,
  onSelectHazard,
}) => {
  const waypoints = corridor.waypoints;
  const currentWp = waypoints[currentWaypointIndex] || waypoints[0];
  const nextWp = waypoints[Math.min(currentWaypointIndex + 1, waypoints.length - 1)];

  // Simulated vehicle position: straight-line interpolation between waypoint
  // coordinates, not snapped to actual roads. Fine for a scripted demo of a
  // seeded corridor; would need real routing (e.g. an OSRM route polyline)
  // before this represents live, road-following driving.
  const vehicleLat = currentWp.lat + (nextWp.lat - currentWp.lat) * simulationProgress;
  const vehicleLng = currentWp.lng + (nextWp.lng - currentWp.lng) * simulationProgress;

  const routeLine = useMemo<[number, number][]>(() => waypoints.map((wp) => [wp.lat, wp.lng]), [waypoints]);

  const vehicleIcon = useMemo(() => dotIcon('#000000', 34, '🚗'), []);
  const landmarkIcon = useMemo(() => dotIcon('#171717', 26, '📍'), []);
  const hazardIcon = (severity: string) => dotIcon(severity === 'critical' ? '#dc2626' : '#d97706', 26, '⚠️');

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] min-h-[480px] rounded-md overflow-hidden bg-asphalt-raised flex flex-col">
      <div className="absolute top-4 left-4 z-[500] flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-asphalt/90 backdrop-blur-sm px-3.5 py-2 rounded-md flex items-center space-x-2 pointer-events-auto">
          <Compass className="w-4 h-4 text-danfo" />
          <span className="text-sm font-medium text-parchment">{corridor.name}</span>
          <span className="text-xs text-parchment-dim">({corridor.distanceKm} km)</span>
        </div>
        <div className="bg-danfo text-asphalt px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{landmarks.length} landmarks seeded</span>
        </div>
      </div>

      <div className="flex-1 relative">
        <LeafletMap
          key={corridor.id}
          bounds={routeLine}
          boundsOptions={{ padding: [70, 70] }}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom
        >
          {/* Standard OpenStreetMap tiles: no key or account needed. The dark
              look comes from a CSS filter on .leaflet-tile-pane (see
              index.css), not from a different tile provider. */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <ZoomControl position="bottomright" />

          <Polyline positions={routeLine} pathOptions={{ color: '#FFC233', weight: 4, opacity: 0.9 }} />

          <Marker position={[vehicleLat, vehicleLng]} icon={vehicleIcon}>
            <Popup>Current vehicle position</Popup>
          </Marker>

          {landmarks.map((lm) => (
            <Marker
              key={lm.id}
              position={[lm.lat, lm.lng]}
              icon={landmarkIcon}
              eventHandlers={{ click: () => onSelectLandmark(lm) }}
            >
              <Popup>
                <strong>{lm.name}</strong>
                <br />
                {lm.description}
              </Popup>
            </Marker>
          ))}

          {hazards.map((hz) => (
            <Marker
              key={hz.id}
              position={[hz.lat, hz.lng]}
              icon={hazardIcon(hz.severity)}
              eventHandlers={{ click: () => onSelectHazard(hz) }}
            >
              <Popup>
                <strong>{hz.title}</strong>
                <br />
                {hz.description}
              </Popup>
            </Marker>
          ))}
        </LeafletMap>
      </div>

      <div className="bg-asphalt-raised p-3 overflow-x-auto flex items-center space-x-2 z-[500]">
        <span className="text-xs text-parchment-dim whitespace-nowrap pl-2 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Landmarks</span>
        </span>
        {landmarks.map((lm) => (
          <button
            key={lm.id}
            onClick={() => onSelectLandmark(lm)}
            className="flex-shrink-0 px-3 py-1.5 rounded bg-asphalt hover:bg-asphalt-line text-parchment text-xs font-medium transition-colors"
          >
            {lm.name}
          </button>
        ))}
      </div>
    </div>
  );
};
