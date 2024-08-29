import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'team_member';
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'team_member'], required: true }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
