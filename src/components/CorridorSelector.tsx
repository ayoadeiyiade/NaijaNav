import React from 'react';
import { RouteCorridor } from '../types';
import { Navigation, Clock, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface CorridorSelectorProps {
  corridors: RouteCorridor[];
  activeCorridorId: string;
  onSelectCorridor: (corridorId: string) => void;
}

export const CorridorSelector: React.FC<CorridorSelectorProps> = ({ corridors, activeCorridorId, onSelectCorridor }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-black text-white flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seeded MVP Corridors</span>
          </span>
        </div>
        <h2 className="text-2xl font-black text-black">Select Nigerian Route Corridor</h2>
        <p className="text-sm text-neutral-600">
          NaijaNav starts with a handful of manually seeded landmarks per corridor (canopies, mechanic workshops,
          defunct filling stations, flyovers) on a small set of test corridors, not full national coverage yet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {corridors.map((cor) => {
          const isActive = cor.id === activeCorridorId;
          return (
            <div
              key={cor.id}
              onClick={() => onSelectCorridor(cor.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                isActive ? 'bg-white border-2 border-black ring-4 ring-black/5' : 'bg-white border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-black bg-neutral-100 px-2.5 py-0.5 rounded-md border border-neutral-200">
                    {cor.city} State
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-black text-white bg-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Active Corridor
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-black">{cor.name}</h3>
                <p className="text-xs text-neutral-600 font-medium">{cor.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200 text-xs">
                <div className="flex items-center space-x-1.5 text-neutral-700 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-black" />
                  <span>
                    Distance: <strong className="text-black font-mono font-bold">{cor.distanceKm} km</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-neutral-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-black" />
                  <span>
                    Est. Time: <strong className="text-black font-mono font-bold">{cor.estMinutes} mins</strong>
                  </span>
                </div>

                <div className="col-span-2 flex items-center space-x-1.5 text-neutral-700 pt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                  <span>
                    Waypoints & Landmarks: <strong className="text-black font-mono font-bold">{cor.waypoints.length} Seeded Steps</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                  isActive ? 'bg-black text-white shadow-md' : 'bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300'
                }`}
              >
                <span>{isActive ? 'Driving This Corridor' : 'Switch To Corridor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
