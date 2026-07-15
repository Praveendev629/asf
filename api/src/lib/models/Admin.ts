import { Schema, models, model } from "mongoose";

export interface IPushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface IAdmin {
  _id: string;
  email: string;
  name: string;
  fcmTokens: string[];
  pushSubscriptions: IPushSub[];
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, default: "Admin" },
    fcmTokens: { type: [String], default: [] },
    pushSubscriptions: {
      type: [{ endpoint: String, keys: { p256dh: String, auth: String } }],
      default: [],
    },
  },
  { timestamps: true }
);

export default models.Admin || model<IAdmin>("Admin", AdminSchema);
