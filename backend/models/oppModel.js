import { Int32 } from "mongodb"
import mongoose from "mongoose"

const OppSchema = new mongoose.Schema({
    no: {
        type: Number,
        required: true,
    },
    no_opportunity: {
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    customer_name : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Costumer"
    },
    opportunity_name: {
        type: String,
        required: true,
    },
    sic: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    closing_date: {
        type: Date,
        required: true,
    },
    no_proposal: {
        type: String,
        required: true,
    },
    firm_budgetary: {
        type: String,
        required: true,
    },
    opp_status: {
        type: String,
        required: true,
    },
    nilai: {
        type: Number,
        required: false,
    },
    ntp: {
        type: Date,
        required:false,
    },
    probability: {
        type: Number,
        required: false,
    },
    gm: {
        type: Number,
        required: false,
    },
    keterangan: {
        type: String,
        required: false,
    },
    handover_status: {
        type: String,
        required: false,
    },
    deleted: {
        type: Boolean,
        required: true,
    }
}, { timestamps: true})

const Opp = mongoose.model("Opp", OppSchema)

export default Opp