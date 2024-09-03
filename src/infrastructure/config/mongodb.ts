// database connection setup
import mongoose from "mongoose";
import { logger } from "../utils/combine_log";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI as string;
    await mongoose.connect(mongoURI);
    logger.info("Mongodb connected successfully");
  } catch (error) {
    logger.error(` Mongodb connection failed ${error}`);
    process.exit(1);
  }
};

export default connectDB;
