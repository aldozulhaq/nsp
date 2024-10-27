import mongoose from "mongoose"
import Project from "../models/projectModel.js"
import { Machine, Manpower, Material } from "../models/costDetailsModel.js"

const getProj = async (req, res) => {
    try {
        const projects = await Project.find().sort({ no: "desc"})
        res.status(200).json({ projects })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const getProjById = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Use aggregate to fetch a single project and join details
        const project = await Project.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            {
              $lookup: {
                from: 'materials',
                localField: 'costs.material_list.material',
                foreignField: '_id',
                as: 'material_details'
              }
            },
            {
              $lookup: {
                from: 'manpowers',
                localField: 'costs.manpower_list.manpower',
                foreignField: '_id',
                as: 'manpower_details'
              }
            },
            {
              $lookup: {
                from: 'machines',
                localField: 'costs.machine_list.machine',
                foreignField: '_id',
                as: 'machine_details'
              }
            },
            {
                $lookup: {
                    from: 'costumers',
                    localField: 'customer_name',
                    foreignField: '_id',
                    as: 'customer_details'
                }
            },
            {
              $project: {
                _id: 1,
                project_name: 1,
                deleted:1,
                customer_name: {
                    $arrayElemAt: [ "$customer_details", 0 ]
                },
                no_project: 1,
                start_date: 1,
                end_date: 1,
                nilai: 1,
                costs: {
                  material_cost: 1,
                  material_list: {
                    $map: {
                      input: "$costs.material_list",
                      as: "item",
                      in: {
                        material: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$material_details",
                                as: "detail",
                                cond: { $eq: ["$$detail._id", "$$item.material"] }
                              }
                            },
                            0
                          ]
                        },
                        amount: "$$item.amount"
                      }
                    }
                  },
                  manpower_cost: 1,
                  manpower_list: {
                    $map: {
                      input: "$costs.manpower_list",
                      as: "item",
                      in: {
                        manpower: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$manpower_details",
                                as: "detail",
                                cond: { $eq: ["$$detail._id", "$$item.manpower"] }
                              }
                            },
                            0
                          ]
                        },
                        amount: "$$item.amount"
                      }
                    }
                  },
                  machine_cost: 1,
                  machine_list: {
                    $map: {
                      input: "$costs.machine_list",
                      as: "item",
                      in: {
                        machine: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$machine_details",
                                as: "detail",
                                cond: { $eq: ["$$detail._id", "$$item.machine"] }
                              }
                            },
                            0
                          ]
                        },
                        amount: "$$item.amount"
                      }
                    }
                  },
                  other_cost: 1,
                  other_description: 1,
                }
              }
            }
          ])
          

        if (!project || project.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.status(200).json({ project: project[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



const addProj = async (req, res) => {

    const {
        opp_ref,
        no_project,
        customer_name,
        project_name,
        start_date,
        end_date,
        nilai,
        gm,
        costs,
        keterangan
    } = req.body;

    if(!opp_ref,
        !customer_name,
        !project_name,
        !nilai,
        !gm
    ) {
        return res.status(400).json({ error: "All fields are required"})
    }

    try {
        const project = await Project.create({
            opp_ref,
            no_project,
            customer_name,
            project_name,
            start_date,
            end_date,
            nilai,
            gm,
            costs,
            keterangan,
            deleted: false
        });

        res.status(200).json({ msg: 'Project created', project });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const archiveProject = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid Project ID" });
  }

  try {
    const project = await Project.findById(req.params.id)

    if(!project) {
      return res.status(404).json({ error: "Project not found"})
    }

    await project.updateOne({deleted: true})
    return res.status(200).json({ msg: 'Project archived', project})
  } catch (error) {
    res.status(500).json({ error: error.message})
  }
}

const restoreProject = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid Project ID" });
  }

  try {
    const project = await Project.findById(req.params.id)

    if(!project) {
      return res.status(404).json({ error: "Project not found"})
    }

    await project.updateOne({deleted: false})
    return res.status(200).json({ msg: 'Project restored', project})
  } catch (error) {
    res.status(500).json({ error: error.message})
  }
}

const deleteProject = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid Project ID" });
  }

  try {
    const project = await Project.findById(req.params.id)

    if(!project) {
      return res.status(404).json({ error: "Project not found"})
    }

    await project.deleteOne()
    return res.status(200).json({ msg: 'Project deleted', project})
  } catch (error) {
    res.status(500).json({ error: error.message})
  }
}

const updateProject = async (req, res) => {
    // Check if ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid Project ID" });
    }

    // Extract fields that are allowed to be updated
    const { no_project, start_date, end_date, costs } = req.body;

    try {
        // Find the project by ID
        const project = await Project.findById(req.params.id);

        // If project not found
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Extract fields from request body
        const { no_project, start_date, end_date, costs } = req.body;

        // Update only the specified fields, initialize them if they don't exist
        if (no_project) project.no_project = no_project;
        if (start_date) project.start_date = start_date;
        if (end_date) project.end_date = end_date;
        if (costs) project.costs = costs;

        // Save updated project
        await project.save();

        return res.status(200).json({ message: "Project updated successfully", project });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Create new cost details
const createCostDetail = async (req, res, model) => {
    const { name, unit_cost, stock } = req.body;

    try {
        const newCostDetail = await model.create({ name, unit_cost, stock });
        return res.status(201).json(newCostDetail);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get all cost details
const getAllCostDetails = async (req, res, model) => {
    try {
        const costDetails = await model.find();
        return res.status(200).json(costDetails);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get a single cost detail by ID
const getCostDetailById = async (req, res, model) => {
    const { id } = req.params;

    try {
        const costDetail = await model.findById(id);
        if (!costDetail) {
            return res.status(404).json({ error: "Cost detail not found" });
        }
        return res.status(200).json(costDetail);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update a cost detail
const updateCostDetail = async (req, res, model) => {
    const { id } = req.params;
    const { name, unit_cost, stock } = req.body;

    try {
        const updatedCostDetail = await model.findByIdAndUpdate(
            id,
            { name, unit_cost, stock },
            { new: true }
        );
        if (!updatedCostDetail) {
            return res.status(404).json({ error: "Cost detail not found" });
        }
        return res.status(200).json(updatedCostDetail);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete a cost detail
const deleteCostDetail = async (req, res, model) => {
    const { id } = req.params;

    try {
        const deletedCostDetail = await model.findByIdAndDelete(id);
        if (!deletedCostDetail) {
            return res.status(404).json({ error: "Cost detail not found" });
        }
        return res.status(200).json({ message: "Cost detail deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const createMaterial = (req, res) => createCostDetail(req, res, Material);
export const createManpower = (req, res) => createCostDetail(req, res, Manpower);
export const createMachine = (req, res) => createCostDetail(req, res, Machine);

export const getAllMaterials = (req, res) => getAllCostDetails(req, res, Material);
export const getAllManpower = (req, res) => getAllCostDetails(req, res, Manpower);
export const getAllMachines = (req, res) => getAllCostDetails(req, res, Machine);

export const getMaterialById = (req, res) => getCostDetailById(req, res, Material);
export const getManpowerById = (req, res) => getCostDetailById(req, res, Manpower);
export const getMachineById = (req, res) => getCostDetailById(req, res, Machine);

export const updateMaterial = (req, res) => updateCostDetail(req, res, Material);
export const updateManpower = (req, res) => updateCostDetail(req, res, Manpower);
export const updateMachine = (req, res) => updateCostDetail(req, res, Machine);

export const deleteMaterial = (req, res) => deleteCostDetail(req, res, Material);
export const deleteManpower = (req, res) => deleteCostDetail(req, res, Manpower);
export const deleteMachine = (req, res) => deleteCostDetail(req, res, Machine);

export { getProj, addProj, updateProject, getProjById, archiveProject, restoreProject, deleteProject }