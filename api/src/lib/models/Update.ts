import { Schema, models, model } from "mongoose";

export interface IUpdate {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const UpdateSchema = new Schema<IUpdate>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Update || model<IUpdate>("Update", UpdateSchema);
