export type HazardCategory = 'market_day' | 'agbero_checkpoint' | 'flood_zone' | 'bad_spot' | 'gridlock' | 'accident';
export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';
export type VoiceStyle = 'Lagos Standard' | 'Warri Sharp' | 'Gentle Uncle';

export interface Landmark {
  id: string;
  name: string;
  category: 'filling_station' | 'mechanic' | 'canopy' | 'bridge' | 'church_mosque' | 'eatery' | 'underpass' | 'statue_junction';
  corridorId: string;
  lat: number;
  lng: number;
  description: string;
  localPhraseCue: string;
  iconName?: string;
  isCustomVerified?: boolean;
}

export interface RoadHazard {
  id: string;
  title: string;
  category: HazardCategory;
  severity: HazardSeverity;
  corridorId: string;
  lat: number;
  lng: number;
  description: string;
  timePattern: string;
  pidginAlertText: string;
  verifyCount: number;
  reportedAt: string;
  userRole?: string;
}

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  standardInstruction: string;
  pidginInstruction: string;
  landmarkId?: string;
  distanceToNextMeters: number;
  hazardId?: string;
}

export interface RouteCorridor {
  id: string;
  name: string;
  city: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  estMinutes: number;
  description: string;
  waypoints: Waypoint[];
  center: { lat: number; lng: number };
  zoom: number;
}

export interface UserReport {
  id: string;
  category: HazardCategory;
  title: string;
  description: string;
  pidginTranscription?: string;
  severity: HazardSeverity;
  corridorId: string;
  lat: number;
  lng: number;
  audioUrl?: string;
  verifiedCount: number;
  status: 'verified' | 'pending' | 'flagged';
  timestamp: string;
  reporterAlias: string;
  reporterBadge: 'Chairman Driver' | 'Junction Master' | 'Route Veteran' | 'Road Scout';
}

export interface NavigationState {
  activeCorridorId: string;
  currentWaypointIndex: number;
  isNavigating: boolean;
  isSimulating: boolean;
  simulationProgress: number;
  currentSpeedKmh: number;
  voiceEnabled: boolean;
  autoSpeak: boolean;
  pidginVoiceAccent: VoiceStyle;
  lastSpokenWaypointId: string | null;
  lastSpokenHazardId: string | null;
}
