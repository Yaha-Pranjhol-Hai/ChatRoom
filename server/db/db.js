import mongoose from "mongoose";

const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Mongo Successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1); // Exit the process with an error code
    }
};

export default connectToMongo;
