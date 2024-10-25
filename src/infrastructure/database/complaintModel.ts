import mongoose, { Document, Schema } from "mongoose";

export interface IComplaint extends Document {
  userId: string;
  subject: string;
  message: string;
  response?: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  response: { type: String },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Complaint = mongoose.model<IComplaint>(
  "Complaint",
  ComplaintSchema,
);
