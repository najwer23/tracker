import { configApiOrigin } from "@/config/configApiOrigin";
import { configFetch, executeFetch, ResponseBase } from "@/config/configFetch";
import { LocationCoords } from "@/locationTracker/LocationTracker.types";

interface mapTrackerSave {
  duration: number,
  totalDistance: number,
  locationsList: LocationCoords[]
}

export const mapTrackerSave = async (body: mapTrackerSave): Promise<ResponseBase> => {
  const url = new URL(`${configApiOrigin()}/tracker/map-tracker/save`);
  const options = { ...configFetch({ method: 'POST', body: body }) };
  return await executeFetch(url, options);
};