// database connection setup

import mongoose from "mongoose";
import dotenv from 'dotenv'

// load environmental variables from .env

dotenv.config()

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI as string
        await mongoose.connect(mongoURI)
        console.log(`database connected successfully`);
    } catch (error) {
        console.log(`database can't connect`,error);
    }
}

export default connectDB