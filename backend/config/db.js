import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const address = process.env.MONGO_URI
        console.log(`trying to connect mongodb server at: ${address}`) 
        await mongoose.connect(address);
        console.log("MongoDB connected successfully from config/db.js");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}