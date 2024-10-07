import mongoose, { Schema, Model } from "mongoose";
import IUser from "../../domain/entities/user";

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    phone_number: {
      type: String,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    user_address: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    is_blocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    record_date: {
      type: Date,
      required: false,
    },
    additional_notes: {
      type: String,
      required: false,
    },
    emergency_contact: {
      type: String,
      required: false,
    },
    medical_history: {
      type: String,
      required: false,
    },
    profile_picture: {
      type: String,
      required: false,
    },
    blood_type: {
      type: String,
      required: false,
    },
    hasCompletedDetails: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const users: Model<IUser> = mongoose.model<IUser>("user", userSchema);

export default users;
