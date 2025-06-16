import React, { createContext, useState, ReactNode, useContext } from "react";
import { LocationCoords } from "./LocationTracker.types";

type LocationTrackerContextType = {
  locationsList: LocationCoords[];
  setLocationsList: React.Dispatch<React.SetStateAction<LocationCoords[]>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  totalDistance: number;
  setTotalDistance: React.Dispatch<React.SetStateAction<number>>;
  qValue: string;
  setQValue: React.Dispatch<React.SetStateAction<string>>;
  rValue: string;
  setRValue: React.Dispatch<React.SetStateAction<string>>;
};

const LocationTrackerContext = createContext<
  LocationTrackerContextType | undefined
>(undefined);

type LocationTrackerProviderProps = {
  children: ReactNode;
};

export const LocationTrackerProvider = ({
  children,
}: LocationTrackerProviderProps) => {
  const [locationsList, setLocationsList] = useState<LocationCoords[]>([]);
  const [duration, setDuration] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [rValue, setRValue] = useState('5');
  const [qValue, setQValue] = useState('0.2');
  

  return (
    <LocationTrackerContext.Provider
      value={{
        qValue,
        setQValue,
        rValue,
        setRValue,
        locationsList,
        setLocationsList,
        duration,
        setDuration,
        totalDistance,
        setTotalDistance,
      }}
    >
      {children}
    </LocationTrackerContext.Provider>
  );
};

// Custom hook for easier usage
export const useLocationTracker = () => {
  const context = useContext(LocationTrackerContext);
  if (!context) {
    throw new Error(
      "useTracking must be used within a LocationTrackerProvider"
    );
  }
  return context;
};
