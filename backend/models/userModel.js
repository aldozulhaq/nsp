import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        deleted: {
            type: Boolean,
            required: true,
        }
    },
    {timestamps: true}
)

const User = mongoose.model("User", userSchema)

export default User