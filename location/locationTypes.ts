// src/types/locationTypes.ts
import * as Location from "expo-location";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationTaskData {
  locations: Location.LocationObject[];
}
