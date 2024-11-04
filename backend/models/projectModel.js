import mongoose from "mongoose";

const CostDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    unit_cost: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Define the Cost schema
const CostSchema = new mongoose.Schema({
    material_cost: {
        type: Number,
        required: true
    },
    material_list: [{
        material:{

            type: CostDetailSchema
        },
        amount:{
            type: Number,
        }
    }],
    manpower_cost: {
        type: Number,
        required: true
    },
    manpower_list: [{
        manpower:{

            type: CostDetailSchema
        },
        amount:{
            type: Number,
        }
    }],
    machine_cost: {
        type: Number,
        required: true
    },
    machine_list: [{
        machine:{
            type: CostDetailSchema
        },
        amount:{
            type: Number,
        }
    }],
    other_cost: {
        type: Number,
        required: false
    },
    other_description: {
        type: [
            {
                description: String,
                cost: Number,
                amount: Number,
            }
        ],
        default: undefined
    }
});

// const CostSchema = new mongoose.Schema({
//     material_cost: {
//         type: Number,
//         required: true
//     },
//     material_list: [{
//         material:{

//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Material",
//             required: true,
//         },
//         amount:{
//             type: Number,
//         }
//     }],
//     manpower_cost: {
//         type: Number,
//         required: true
//     },
//     manpower_list: [{
//         manpower:{

//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Material",
//             required: true,
//         },
//         amount:{
//             type: Number,
//         }
//     }],
//     machine_cost: {
//         type: Number,
//         required: true
//     },
//     machine_list: [{
//         machine:{

//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Material",
//             required: true,
//         },
//         amount:{
//             type: Number,
//         }
//     }],
//     other_cost: {
//         type: Number,
//         required: false
//     },
//     other_description: {
//         type: [
//             {
//                 description: String,
//                 cost: Number,
//                 amount: Number,
//             }
//         ],
//         default: undefined
//     }
// });


// Define the Project schema and embed the Cost schema
const ProjectSchema = new mongoose.Schema({
    opp_ref: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Opp"
    },
    no_project: {
        type: String,
        required: true
    },
    customer_name: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    },
    project_name: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: false
    },
    end_date: {
        type: Date,
        required: false
    },
    nilai: {
        type: Number,
        required: true
    },
    gm: {
        type: Number,
        required: true
    },
    costs: CostSchema,
    desc: {
        type: String,
        required: false
    },
    project_status: {
        type: String,
        required: false
    },
    deleted: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

const Project = mongoose.model("Project", ProjectSchema);

export default Project;
