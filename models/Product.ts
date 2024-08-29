import mongoose, { Document, Schema } from 'mongoose';

interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

// const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
