import mongoose from "mongoose";

export const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected");
    } catch (error) {
        console.log(error,"error db connection");
        process.exit(1);
    }
}