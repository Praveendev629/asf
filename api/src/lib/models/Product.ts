import mongoose, { Schema, models, model } from "mongoose";

export interface IProductVariant {
  name: string;
  slug: string;
  price: number;
  mrp: number;
  stock: number;
  image: string;
  attributes: Record<string, string>; // e.g. { color: "Red", size: "XL" }
}

export interface ISpecification {
  label: string;
  value: string;
  icon?: string;
}

export interface IUnitOption {
  label: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  unit: string;
  unitType: "weight" | "volume" | "length" | "size" | "none";
  unitOptions: IUnitOption[];
  mrp: number;
  price: number;
  stock: number;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  variants: IProductVariant[];
  relatedProducts: string[];
  specifications: ISpecification[];
  productType: string;
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
    unitType: { type: String, enum: ["weight", "volume", "length", "size", "none"], default: "none" },
    unitOptions: { type: [{ label: String, price: Number, mrp: Number, stock: Number }], default: [] },
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 4.3 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    variants: {
      type: [{
        name: String,
        slug: String,
        price: Number,
        mrp: Number,
        stock: Number,
        image: String,
        attributes: { type: Schema.Types.Mixed, default: {} },
      }],
      default: [],
    },
    relatedProducts: { type: [String], default: [] },
    specifications: { type: [{ label: String, value: String, icon: String }], default: [] },
    productType: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
