"use client";

import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100%" };

export default function DeliveryMap({ originLat, originLng, destLat, destLng }: { originLat: number; originLng: number; destLat: number; destLng: number }) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const center = { lat: (originLat + destLat) / 2, lng: (originLng + destLng) / 2 };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    const ds = new google.maps.DirectionsService();
    ds.route({ origin: { lat: originLat, lng: originLng }, destination: { lat: destLat, lng: destLng }, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) setDirections(result);
    });
  }, [originLat, originLng, destLat, destLng]);

  if (loadError) return <div className="w-full h-72 rounded-2xl border border-red-200 bg-red-50 flex items-center justify-center text-red-600 text-sm">Failed to load Google Maps.</div>;
  if (!isLoaded) return <div className="w-full h-72 rounded-2xl border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-sm animate-pulse">Loading map...</div>;

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-gray-200">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} onLoad={onMapLoad} options={{ streetViewControl: false, mapTypeControl: false }}>
        <Marker position={{ lat: originLat, lng: originLng }} label="You" icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />
        <Marker position={{ lat: destLat, lng: destLng }} label="Customer" icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }} />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}
