import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName:{
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        default: 0,
        min: 0
    },
    password: {
        type: String,
        required: true
    }
})

export default mongoose.model("User", userSchema);