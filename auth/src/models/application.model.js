import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    github: {
        type: String
    },
    experience: {
        type: String
    },
    usecase: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;
