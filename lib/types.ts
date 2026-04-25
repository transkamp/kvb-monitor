export interface Stop {
  id: string;
  name: string;
  shortName?: string;
  lat?: number;
  lon?: number;
}

export interface Favorite extends Stop {
  addedAt: number;
}

export interface ServingLine {
  number: string;
  destination: string;
  direction: string;
  type: string;
  operatorName?: string;
}

export type RealtimeQuality =
  | "live"             // Echtzeit-Daten verfügbar (Fahrzeug funkt + Prognose)
  | "predicted"        // Echtzeit-System aktiv, aber keine Prognose
  | "scheduled"        // Nur Fahrplan-Daten, keine Echtzeit
  | "extra"            // Sonderfahrt / zusätzliche Fahrt
  | "cancelled"        // Trip entfällt komplett
  | "stop-cancelled";  // Dieser Halt entfällt

export interface DepartureHint {
  content: string;
  type: string;
}

export interface Departure {
  id: string;
  servingLine: ServingLine;
  dateTime: {
    date: string;
    time: string;
    timestamp: number;
  };
  realDateTime?: {
    date: string;
    time: string;
    timestamp: number;
  };
  delay?: number;
  platform?: string;
  platformName?: string;
  realtimeQuality: RealtimeQuality;
  hints?: DepartureHint[];
}

export interface EFAStopFinderResponse {
  stopFinder: {
    pois?: {
      poi: any[];
    };
    stops?: {
      stop: any[];
    };
  };
}

export interface EFADepartureResponse {
  departureList?: any[];
}

export interface TripStop {
  id: string;
  name: string;
  shortName?: string;
  platform?: string;
  arrivalTime?: string;
  departureTime?: string;
  isPassed: boolean;
  isOrigin: boolean;
  isDestination: boolean;
}