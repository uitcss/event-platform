import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
    try {
        const mongoDB_address = process.env.MONGO_REMOTE
        await mongoose.connect(
            mongoDB_address
        );
        console.log(`MongoDB connected successfully from db.js to db: ${mongoDB_address}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}