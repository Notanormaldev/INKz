import mongoose from "mongoose";



const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.AUTH_MONGO_URI)
        console.log("Auth database connected");
    } catch (error) {
        console.log(error);
    }
}

export default connectDB