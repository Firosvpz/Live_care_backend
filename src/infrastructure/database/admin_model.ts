import mongoose, { Schema, Model } from "mongoose";
import { IAdmin } from "../../domain/entities/admin";

const adminSchema: Schema<IAdmin> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const admin: Model<IAdmin> = mongoose.model("admin", adminSchema);

export default admin;
