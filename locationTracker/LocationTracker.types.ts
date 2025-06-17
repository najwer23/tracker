import * as Location from "expo-location";

export interface LocationCoords {
  lat: number;
  lon: number;
  a?: number | null; // accuracy
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationTaskData {
  locations: Location.LocationObject[];
}
