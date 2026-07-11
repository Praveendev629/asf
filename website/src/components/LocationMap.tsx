"use client";

import { useCallback, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Search } from "lucide-react";

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 28.6139, lng: 77.209 };

export default function LocationMap({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const [center, setCenter] = useState({ lat, lng });
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ["formatted_address", "geometry"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const newLat = place.geometry.location.lat();
          const newLng = place.geometry.location.lng();
          setCenter({ lat: newLat, lng: newLng });
          onChange(newLat, newLng);
          setSearchValue(place.formatted_address || "");
          map.panTo({ lat: newLat, lng: newLng });
          map.setZoom(16);
        }
      });
      autocompleteRef.current = autocomplete;
    }
  }, [onChange]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setCenter({ lat: newLat, lng: newLng });
      onChange(newLat, newLng);
      setSearchValue("");
    }
  }, [onChange]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setCenter({ lat: newLat, lng: newLng });
          onChange(newLat, newLng);
        },
        () => {}
      );
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-72 rounded-2xl border border-red-200 bg-red-50 flex items-center justify-center text-red-600 text-sm">
        Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-72 rounded-2xl border border-asf-mist bg-asf-mist/30 flex items-center justify-center text-asf-slate text-sm animate-pulse">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-asf-mist">
      {/* Search Bar */}
      <div className="bg-white p-3 flex gap-2">
        <div className="flex items-center flex-1 border border-asf-mist rounded-xl px-3 py-2">
          <Search size={16} className="text-asf-slate mr-2 shrink-0" />
          <input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search location (e.g. Connaught Place, Delhi)"
            className="flex-1 outline-none text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="bg-asf-slateDeep text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-asf-copper transition whitespace-nowrap"
        >
          My Location
        </button>
      </div>

      {/* Map */}
      <div className="h-72">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          onClick={onMapClick}
          onLoad={onMapLoad}
          options={{ streetViewControl: false, mapTypeControl: false }}
        >
          <Marker position={center} />
        </GoogleMap>
      </div>

      {/* Coordinates */}
      <div className="bg-white px-3 py-2 border-t border-asf-mist text-xs text-asf-slate">
        Lat: {center.lat.toFixed(6)}, Lng: {center.lng.toFixed(6)}
      </div>
    </div>
  );
}
