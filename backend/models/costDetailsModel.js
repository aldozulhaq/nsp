import mongoose from "mongoose";

const CostDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    unit_cost: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Material = mongoose.model("Material", CostDetailSchema);

const Manpower = mongoose.model("Manpower", CostDetailSchema);

const Machine = mongoose.model("Machine", CostDetailSchema);

export { Material, Manpower, Machine };
