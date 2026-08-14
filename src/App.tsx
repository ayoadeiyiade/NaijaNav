import React, { useState, useEffect } from 'react';
import { RouteCorridor, Landmark, RoadHazard, UserReport, VoiceStyle } from './types';
import { SEEDED_CORRIDORS } from './data/corridors';
import { SEEDED_LANDMARKS } from './data/landmarks';
import { SEEDED_HAZARDS } from './data/hazards';

import { Navbar } from './components/Navbar';
import { MapContainer } from './components/MapContainer';
import { NavigationHUD } from './components/NavigationHUD';
import { HistoricalIntelligencePanel } from './components/HistoricalIntelligencePanel';
import { CorridorSelector } from './components/CorridorSelector';
import { ReportMatterModal } from './components/ReportMatterModal';
import { AudioPhraseBankModal } from './components/AudioPhraseBankModal';
import { ContributorLeaderboard } from './components/ContributorLeaderboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { announcePidginCue } from './lib/audioEngine';

export default function App() {
  // Corridors & Active State
  const [corridors, setCorridors] = useState<RouteCorridor[]>(SEEDED_CORRIDORS);
  const [activeCorridorId, setActiveCorridorId] = useState<string>('ikorodu-road');
  const [landmarks, setLandmarks] = useState<Landmark[]>(SEEDED_LANDMARKS);
  const [hazards, setHazards] = useState<RoadHazard[]>(SEEDED_HAZARDS);
  const [reports, setReports] = useState<UserReport[]>([]);

  // Simulation & Driving State
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [pidginVoiceAccent, setPidginVoiceAccent] = useState<VoiceStyle>('Lagos Standard');

  // Active View Tabs & Modals
  const [activeTab, setActiveTab] = useState<'map' | 'hazards' | 'corridors'>('map');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPhraseBankOpen, setIsPhraseBankOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  const [, setSelectedLandmark] = useState<Landmark | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<RoadHazard | null>(null);

  // Real device location for "Report Matter" pins. null until we get a
  // successful fix (or the user denies/lacks geolocation), at which point
  // we fall back to the active corridor's center point rather than a
  // hardcoded coordinate — the previous build always dropped pins near
  // Ikorodu Road regardless of which corridor was active.
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationDenied(true),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
  const hasValidMapKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  const activeCorridor = corridors.find((c) => c.id === activeCorridorId) || corridors[0];
  const activeWaypoints = activeCorridor.waypoints;
  const currentWaypoint = activeWaypoints[currentWaypointIndex] || activeWaypoints[0];
  const nextWaypoint = activeWaypoints[currentWaypointIndex + 1];

  const currentLandmark = landmarks.find((l) => l.id === currentWaypoint.landmarkId);
  const currentHazard = hazards.find((h) => h.id === currentWaypoint.hazardId);

  const corridorLandmarks = landmarks.filter((l) => l.corridorId === activeCorridor.id);
  const corridorHazards = hazards.filter((h) => h.corridorId === activeCorridor.id);
  const corridorReports = reports.filter((r) => r.corridorId === activeCorridor.id);

  const reportLocation = userLocation || activeCorridor.center;
  const locationIsPrecise = Boolean(userLocation);

  // Fetch API server data on boot
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [cRes, lRes, hRes, rRes] = await Promise.all([
          fetch('/api/corridors').then((r) => r.json()).catch(() => ({ corridors: SEEDED_CORRIDORS })),
          fetch('/api/landmarks').then((r) => r.json()).catch(() => ({ landmarks: SEEDED_LANDMARKS })),
          fetch('/api/hazards').then((r) => r.json()).catch(() => ({ hazards: SEEDED_HAZARDS })),
          fetch('/api/reports').then((r) => r.json()).catch(() => ({ reports: [] })),
        ]);

        if (cRes.corridors) setCorridors(cRes.corridors);
        if (lRes.landmarks) setLandmarks(lRes.landmarks);
        if (hRes.hazards) setHazards(hRes.hazards);
        if (rRes.reports) setReports(rRes.reports);
      } catch (err) {
        console.warn('Backend server loading fallback:', err);
      }
    }
    loadBackendData();
  }, []);

  // Route Simulation Timer Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        const next = prev + 0.04 * simSpeedMultiplier;
        if (next >= 1) {
          if (currentWaypointIndex < activeWaypoints.length - 1) {
            const newIndex = currentWaypointIndex + 1;
            setCurrentWaypointIndex(newIndex);

            if (voiceEnabled) {
              const wp = activeWaypoints[newIndex];
              announcePidginCue(wp.pidginInstruction, pidginVoiceAccent);
            }
            return 0;
          } else {
            setIsSimulating(false);
            return 1;
          }
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isSimulating, currentWaypointIndex, activeWaypoints, simSpeedMultiplier, voiceEnabled, pidginVoiceAccent]);

  const handleSelectCorridor = (corridorId: string) => {
    setActiveCorridorId(corridorId);
    setCurrentWaypointIndex(0);
    setSimulationProgress(0);
    setIsSimulating(false);
    setActiveTab('map');
  };

  const handleAddReport = async (newReportData: Partial<UserReport>) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReportData),
      });
      if (!res.ok) {
        console.warn('Report submission failed:', res.status);
        return;
      }
      const data = await res.json();
      if (data.success && data.report) {
        setReports((prev) => [data.report, ...prev]);
      }
    } catch (err) {
      console.warn('Error saving report:', err);
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/verify`, { method: 'POST' });
      if (!res.ok) {
        console.warn('Verify failed:', res.status);
        return;
      }
      const data = await res.json();
      if (data.success && data.report) {
        setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
      }
    } catch (err) {
      console.warn('Error verifying report:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-black font-sans selection:bg-black selection:text-white flex flex-col">
      <Navbar
        activeCorridorName={activeCorridor.name}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenPhraseBankModal={() => setIsPhraseBankOpen(true)}
        onOpenLeaderboardModal={() => setIsLeaderboardOpen(true)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        hasValidMapKey={hasValidMapKey}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'map' && (
          <div className="space-y-6">
            <NavigationHUD
              corridor={activeCorridor}
              currentWaypointIndex={currentWaypointIndex}
              currentWaypoint={currentWaypoint}
              nextWaypoint={nextWaypoint}
              currentHazard={currentHazard}
              nearestLandmark={currentLandmark}
              isSimulating={isSimulating}
              onToggleSimulate={() => setIsSimulating(!isSimulating)}
              onResetSimulation={() => {
                setCurrentWaypointIndex(0);
                setSimulationProgress(0);
                setIsSimulating(false);
              }}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              pidginVoiceAccent={pidginVoiceAccent}
              onChangeAccent={setPidginVoiceAccent}
              simSpeedMultiplier={simSpeedMultiplier}
              onChangeSimSpeed={setSimSpeedMultiplier}
            />

            <MapContainer
              corridor={activeCorridor}
              landmarks={corridorLandmarks}
              hazards={corridorHazards}
              currentWaypointIndex={currentWaypointIndex}
              simulationProgress={simulationProgress}
              isSimulating={isSimulating}
              onSelectLandmark={setSelectedLandmark}
              onSelectHazard={setSelectedHazard}
              hasValidKey={hasValidMapKey}
            />
          </div>
        )}

        {activeTab === 'hazards' && (
          <HistoricalIntelligencePanel
            hazards={corridorHazards}
            reports={corridorReports}
            onVerifyReport={handleVerifyReport}
            onSelectHazardOnMap={(hz) => {
              setSelectedHazard(hz);
              setActiveTab('map');
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'corridors' && (
          <CorridorSelector corridors={corridors} activeCorridorId={activeCorridorId} onSelectCorridor={handleSelectCorridor} />
        )}
      </main>

      <ReportMatterModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeCorridorId={activeCorridorId}
        reportLocation={reportLocation}
        locationIsPrecise={locationIsPrecise}
        onAddReport={handleAddReport}
      />

      <AudioPhraseBankModal
        isOpen={isPhraseBankOpen}
        onClose={() => setIsPhraseBankOpen(false)}
        landmarks={corridorLandmarks}
        hazards={corridorHazards}
      />

      <ContributorLeaderboard isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} reports={reports} />

      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} hasValidKey={hasValidMapKey} />

      <footer className="bg-white border-t border-neutral-200 text-xs text-neutral-600 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-black">NaijaNav — Localized Nigerian Turn-by-Turn Navigation & Road Intelligence</p>
          <p className="text-[11px] text-neutral-500 mt-1 font-medium">
            Landmark-based Pidgin-flavored voice cues, seeded road intelligence & driver reporting.
            {locationDenied ? ' Location access unavailable — reports will pin to the corridor center.' : ''}
          </p>
        </div>
      </footer>
    </div>
  );
}
