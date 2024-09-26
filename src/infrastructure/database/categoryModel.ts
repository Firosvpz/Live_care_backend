import mongoose, { Model, Schema } from "mongoose";
import Category from "../../domain/entities/category";
const categorySchema: Schema<Category> = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  subCategories: {
    type: [String],
    required: true,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
});

const CategoryModel: Model<Category> = mongoose.model(
  "Category",
  categorySchema,
);

export { CategoryModel };
