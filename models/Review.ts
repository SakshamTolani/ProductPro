import mongoose, { Schema, Document } from 'mongoose';

interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  changes: object;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  changes: { type: Object, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);