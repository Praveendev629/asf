import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/lib/models/Product";

const SAMPLE_PRODUCTS = [
  { name: "Fresh Bananas", category: "Fruits & Vegetables", unit: "1 dozen", mrp: 60, price: 45, stock: 120, images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600"] },
  { name: "Organic Tomatoes", category: "Fruits & Vegetables", unit: "500 g", mrp: 40, price: 32, stock: 80, images: ["https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=600"] },
  { name: "Farm Fresh Eggs", category: "Dairy & Eggs", unit: "12 pieces", mrp: 90, price: 78, stock: 60, images: ["https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600"] },
  { name: "Toned Milk", category: "Dairy & Eggs", unit: "1 litre", mrp: 62, price: 58, stock: 100, images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600"] },
  { name: "Whole Wheat Bread", category: "Bakery", unit: "400 g", mrp: 55, price: 45, stock: 40, images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"] },
  { name: "Potato Chips", category: "Snacks", unit: "150 g", mrp: 40, price: 35, stock: 150, images: ["https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=600"] },
  { name: "Orange Juice", category: "Beverages", unit: "1 litre", mrp: 120, price: 99, stock: 70, images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600"] },
  { name: "Dish Wash Liquid", category: "Household", unit: "500 ml", mrp: 130, price: 109, stock: 90, images: ["https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600"] },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
  console.log("Connected. Seeding products...");

  for (const p of SAMPLE_PRODUCTS) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await Product.updateOne(
      { name: p.name },
      { $setOnInsert: { ...p, slug, description: `Premium quality ${p.name.toLowerCase()}, sourced fresh for ASF Shopee.` } },
      { upsert: true }
    );
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
