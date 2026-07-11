import { Schema, models, model } from "mongoose";

export interface IDeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  isAvailable: boolean;
  currentLocation?: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    currentLocation: { lat: Number, lng: Number },
  },
  { timestamps: true }
);

export default models.DeliveryPartner ||
  model<IDeliveryPartner>("DeliveryPartner", DeliveryPartnerSchema);
