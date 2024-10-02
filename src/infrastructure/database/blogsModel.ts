import mongoose, { Schema, Document } from "mongoose";
import { IBlog } from "../../domain/entities/blogs";

interface BlogDocument extends IBlog, Document {}

const blogSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  image: { type: String },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isListed: { type: Boolean, default: true },
});

export const BlogModel = mongoose.model<BlogDocument>("Blog", blogSchema);
