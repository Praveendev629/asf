import { Schema, models, model } from "mongoose";

export interface IAdmin {
  _id: string;
  email: string;
  name: string;
  fcmTokens: string[];
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, default: "Admin" },
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default models.Admin || model<IAdmin>("Admin", AdminSchema);
