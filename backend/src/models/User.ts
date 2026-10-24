import { Schema, model, type HydratedDocument } from "mongoose";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt?: string;
  offerNote?: string;
  createdAt: string;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    emailVerifiedAt: { type: String },
    offerNote: { type: String, maxlength: 1000 },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

export const UserModel = model<User>("User", userSchema);
