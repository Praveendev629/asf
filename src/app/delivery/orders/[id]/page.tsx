"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  Clock,
  User,
  Package,
} from "lucide-react";
import dynamic from "next/dynamic";

const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), { ssr: false });

interface Order {
  _id: string;
  orderNumber: string;
  userName: string;
  userPhone: string;
  total: number;
  status: string;
  items: { name: string; price: number; quantity: number }[];
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  deliveryPartner?: {
    name: string;
    phone: string;
    eta: string;
    lat?: number;
    lng?: number;
  };
}

export default function DeliveryOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("delivery_token");
    if (!token) {
      router.push("/delivery/login");
      return;
    }

    fetch(`/api/delivery/orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrder(data.order));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, [params.id]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  const hasMap =
    myLocation &&
    order.deliveryAddress.lat &&
    order.deliveryAddress.lng;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white/60 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-semibold">#{order.orderNumber}</h1>
            <p className="text-white/60 text-xs">Order Details</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Map */}
        {hasMap && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <DeliveryMap
              originLat={myLocation.lat}
              originLng={myLocation.lng}
              destLat={order.deliveryAddress.lat!}
              destLng={order.deliveryAddress.lng!}
            />
            <div className="p-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${myLocation.lat},${myLocation.lng}&destination=${order.deliveryAddress.lat},${order.deliveryAddress.lng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                <Navigation size={16} />
                Open in Google Maps
              </a>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User size={18} />
            Customer Details
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User size={14} className="text-gray-400" />
              {order.userName}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gray-400" />
              <a href={`tel:${order.userPhone}`} className="text-blue-600 font-medium">
                +91 {order.userPhone}
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <span>
                {order.deliveryAddress.line1}
                {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""},{" "}
                {order.deliveryAddress.city}, {order.deliveryAddress.state} -{" "}
                {order.deliveryAddress.pincode}
              </span>
            </div>
            {order.deliveryPartner?.eta && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-gray-400" />
                <span className="font-medium text-amber-600">
                  ETA: {order.deliveryPartner.eta}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package size={18} />
            Order Items
          </h2>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
