import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_REMOTE
        );
        console.log("MongoDB connected successfully from db.js");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}