export interface TripStop {
  id: string;
  name: string;
  platform?: string;
  arrivalTime?: string;
  departureTime?: string;
  isPassed: boolean;
  isOrigin: boolean;
  isDestination: boolean;
}