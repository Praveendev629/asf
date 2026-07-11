"use client";

import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 28.6139, lng: 77.209 };

export default function LocationMap({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" });
  const [center, setCenter] = useState({ lat, lng });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setCenter({ lat: newLat, lng: newLng });
      onChange(newLat, newLng);
    }
  }, [onChange]);

  if (loadError) return <div className="w-full h-72 rounded-2xl border border-red-200 bg-red-50 flex items-center justify-center text-red-600 text-sm">Failed to load Google Maps.</div>;
  if (!isLoaded) return <div className="w-full h-72 rounded-2xl border border-asf-mist bg-asf-mist/30 flex items-center justify-center text-asf-slate text-sm animate-pulse">Loading map...</div>;

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-asf-mist">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15} onClick={onMapClick} options={{ streetViewControl: false, mapTypeControl: false }}>
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}
