// filepath: d:\LUPUL\my-typescript-app\src\models\Product.server.ts
// Server-side Product model using Mongoose - only for Node.js environment
import mongoose, { Document, Schema, Model } from "mongoose";
// Import mongoose-delete using require to avoid type issues
const mongooseDelete = require("mongoose-delete");

export interface IProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  image?: string;
  inStock?: boolean;
  discount?: number;
  active: boolean;
  restore: () => Promise<IProductDocument>;
  delete: () => Promise<IProductDocument>;
}

// Interface for the model with specific methods
export interface ProductModel extends Model<IProductDocument> {
  findOneDeleted: (query: any) => Promise<IProductDocument | null>;
  restore: (query: any) => Promise<IProductDocument>;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    image: { type: String },
    inStock: { type: Boolean, default: true },
    discount: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Add mongoose-delete plugin
ProductSchema.plugin(mongooseDelete, { overrideMethods: true });

// Create or get the model
const Product = mongoose.models.Product as ProductModel || 
                mongoose.model<IProductDocument, ProductModel>("Product", ProductSchema);

export default Product;