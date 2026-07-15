import { Schema, models, model } from "mongoose";

export interface IPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface IUser {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  onboardingComplete: boolean;
  fcmTokens: string[];
  pushSubscriptions: IPushSubscription[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    photoURL: { type: String },
    phone: { type: String },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    onboardingComplete: { type: Boolean, default: false },
    fcmTokens: { type: [String], default: [] },
    pushSubscriptions: {
      type: [{ endpoint: String, keys: { p256dh: String, auth: String } }],
      default: [],
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
