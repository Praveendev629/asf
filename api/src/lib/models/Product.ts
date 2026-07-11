import mongoose, { Schema, models, model } from "mongoose";

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  unit: string;
  mrp: number;
  price: number;
  stock: number;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    unit: { type: String, default: "1 unit" },
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 4.3 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
