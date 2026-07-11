import { Schema, models, model } from "mongoose";

export const ORDER_STAGES = [
  "placed",
  "confirmed",
  "packed",
  "dispatched",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];

export interface IOrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStage;
  statusHistory: { status: OrderStage; at: Date }[];
  deliveryPartner?: {
    name: string;
    phone: string;
    eta: string;
    lat?: number;
    lng?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    userName: String,
    userEmail: String,
    userPhone: { type: String, required: true },
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    items: [
      {
        product: String,
        name: String,
        image: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: Number,
    deliveryFee: Number,
    total: Number,
    status: { type: String, default: "placed" },
    statusHistory: [{ status: String, at: Date }],
    deliveryPartner: {
      name: String,
      phone: String,
      eta: String,
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);
