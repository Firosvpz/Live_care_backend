import mongoose, { Schema, Model } from "mongoose";
import IService_provider from "../../domain/entities/service_provider";

// Define the schema for the Service Provider
const Service_provider_schema: Schema<IService_provider> = new Schema(
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
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: false,
    },
    service: {
      type: String,
    },
    specialization: {
      type: String,
    },
    qualification: {
      type: String,
    },
    profile_picture: {
      type: String,
    },
    experience_crt: {
      type: String,
    },
    exp_year: {
      type: Number,
    },
    rate: {
      type: Number,
    },
    address: {
      type: String,
    },
    is_approved: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Pending",
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    hasCompletedDetails: {
      type: Boolean,
      default: false,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: false },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Create and export the model
const service_provider: Model<IService_provider> =
  mongoose.model<IService_provider>("serviceProvider", Service_provider_schema);

export { service_provider };
