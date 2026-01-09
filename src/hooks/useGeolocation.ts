import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = "Geolocation is not supported by your browser";
        setState((prev) => ({ ...prev, error, loading: false }));
        reject(new Error(error));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setState({
            latitude,
            longitude,
            error: null,
            loading: false,
          });
          resolve({ latitude, longitude });
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 120000,
        }
      );
    });
  }, []);

  const generateMapsLink = (latitude: number, longitude: number): string => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  return {
    ...state,
    getLocation,
    generateMapsLink,
  };
};
