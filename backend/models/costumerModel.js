import mongoose from "mongoose";

const costumerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    desc: {
        type: String,
        required: false
    },
    deleted: {
        type: Boolean,
        required: true,
    }
},{timestamps: true})

const Costumer = mongoose.model("Costumer", costumerSchema)

export default Costumer