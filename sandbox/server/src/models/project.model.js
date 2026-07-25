import mongoose from "mongoose";

const projectschema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    projectid:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        default:"Untitled Project"
    }   
},{
    timestamps:true
})



const Project = mongoose.model('Project', projectschema)
export default Project