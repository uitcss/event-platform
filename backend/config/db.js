import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://vikasgudi:gmail123%40G@uucsc.885eczz.mongodb.net/mydb?retryWrites=true&w=majority'
        );
        console.log("MongoDB connected successfully from db.js");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}