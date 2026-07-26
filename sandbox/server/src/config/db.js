import mongoose from "mongoose";


export const connectdb = async () => {
    try {
        await mongoose.connect(process.env.SANDBOX_MONGO_URI)
        console.log("Sandbox database connected")
    } catch (error) {
        console.log("Sandbox database connection error", error)
    }
}


