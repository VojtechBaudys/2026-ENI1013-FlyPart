export interface Coordinates {
  lat: number;
  lng: number;
}

export type DroneStatus = 
  | 'DISARMED' 
  | 'TAKING_OFF' 
  | 'EN_ROUTE_TO_SITE' 
  | 'DELIVERING' 
  | 'RETURNING_TO_BASE' 
  | 'REPOSITIONING' // New status for moving between hubs
  | 'LANDING' 
  | 'IDLE_AT_BASE';

export interface DroneTelemetry {
  altitude: number; // meters
  speed: number; // km/h
  battery: number; // percentage
  satelliteCount: number;
  signalStrength: number; // percentage
  heading: number; // degrees 0-360
  status: DroneStatus;
}

export interface Drone {
  id: string;
  currentHubId: string; // The hub the drone is currently located at or assigned to
  targetHubId?: string; // Where the drone is moving to (if repositioning)
  label: string;
  position: Coordinates;
  telemetry: DroneTelemetry;
  history: { time: string; altitude: number; speed: number }[];
  activeOrder: DeliveryOrder | null;
  flightPhaseTime: number; 
}

export type TradeCategory = 'GENERAL' | 'ELECTRICAL' | 'PLUMBING';

export interface Hub {
  id: string;
  name: string;
  coordinates: Coordinates;
  category: TradeCategory;
  color: string;
}

export interface DeliveryOrder {
  id: string;
  hubId: string; // The hub where the item is stocked
  recipient: string;
  locationName: string;
  locationType: 'KNOWN_PAD' | 'DYNAMIC_SITE'; 
  item: string;
  category: TradeCategory;
  weight: string;
  coordinates: Coordinates;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
}

export enum MapMode {
  SATELLITE = 'satellite',
  STREET = 'street',
  DARK = 'dark'
}