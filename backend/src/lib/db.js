import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Additional options for better connection handling
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 90000,
      socketTimeoutMS: 75000,
    });
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1); // Exit if database connection fails
  }
};
