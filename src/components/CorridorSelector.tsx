import React from 'react';
import { RouteCorridor } from '../types';
import { Navigation, Clock, MapPin, ArrowRight } from 'lucide-react';

interface CorridorSelectorProps {
  corridors: RouteCorridor[];
  activeCorridorId: string;
  onSelectCorridor: (corridorId: string) => void;
}

export const CorridorSelector: React.FC<CorridorSelectorProps> = ({ corridors, activeCorridorId, onSelectCorridor }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-3xl text-parchment">Pick a corridor</h2>
        <p className="text-sm text-parchment-dim max-w-2xl">
          A handful of manually seeded Lagos-area routes, not full coverage yet. Each has a small set of
          landmarks and known hazards built in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {corridors.map((cor) => {
          const isActive = cor.id === activeCorridorId;
          return (
            <div
              key={cor.id}
              onClick={() => onSelectCorridor(cor.id)}
              className={`p-5 rounded-md cursor-pointer transition-colors flex flex-col justify-between space-y-4 ${
                isActive ? 'bg-danfo text-asphalt' : 'bg-asphalt-raised text-parchment hover:bg-asphalt-line'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isActive ? 'text-asphalt/70' : 'text-parchment-dim'}`}>{cor.city} state</span>
                  {isActive && <span className="text-xs font-semibold">Driving now</span>}
                </div>
                <h3 className="font-display text-xl leading-tight">{cor.name}</h3>
                <p className={`text-xs ${isActive ? 'text-asphalt/80' : 'text-parchment-dim'}`}>{cor.description}</p>
              </div>

              <div className={`grid grid-cols-2 gap-2 pt-3 border-t text-xs ${isActive ? 'border-asphalt/20' : 'border-asphalt-line'}`}>
                <div className="flex items-center space-x-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{cor.distanceKm} km</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{cor.estMinutes} min</span>
                </div>
                <div className="col-span-2 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{cor.waypoints.length} seeded waypoints</span>
                </div>
              </div>

              <button
                type="button"
                className={`w-full py-2 rounded font-medium text-sm flex items-center justify-center space-x-2 transition-colors ${
                  isActive ? 'bg-asphalt text-danfo' : 'bg-asphalt text-parchment hover:bg-asphalt/70'
                }`}
              >
                <span>{isActive ? 'Currently active' : 'Switch to this corridor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
