export type Role = "rider" | "driver" | "both";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place extends LatLng {
  label?: string;
}

export interface Vehicle {
  make: string;
  model: string;
  plate: string;
  color?: string;
}

export interface SpeedCarProfile {
  name: string;
  avatar?: string;
  vehicle?: Vehicle;
}

export type TripState =
  | "requested"
  | "offered"
  | "accepted"
  | "en_route_pickup"
  | "arrived_pickup"
  | "in_progress"
  | "arrived_dropoff"
  | "completed"
  | "cancelled";
