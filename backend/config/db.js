import mongoose from "mongoose";

let connected = false;

export const connectDB = async () => {
    //persist connection (don't recreate on each invocation)
    if(connected)
        return;
    const mongoDB_address = process.env.MONGO_REMOTE
    try {
        const conn = await mongoose.connect(mongoDB_address, {
            serverSelectionTimeoutMS: 5000
        });
        connected = (conn.connection.readyState === 1);
        console.log(`MongoDB connected successfully from db.js to db: ${mongoDB_address}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}