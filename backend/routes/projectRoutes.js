import express from 'express'
import auth from "../middleware/auth.js"
import { createMaterial, createManpower, createMachine, getAllMaterials, getAllManpower, getAllMachines, getMaterialById, getManpowerById, getMachineById, updateMaterial, updateManpower, updateMachine, deleteMaterial, deleteManpower, deleteMachine, getProj, updateProject, getProjById, archiveProject, restoreProject, getProjById2 } from '../controller/projectController.js'

const router = express.Router()

router.get('/', auth, getProj)

router.get('/detail/:id', auth, getProjById2)

router.put('/:id', auth, updateProject)

router.put('/archive/:id', auth, archiveProject)

router.put('/restore/:id', auth, restoreProject)

// Material Routes
router.post("/materials", createMaterial);
router.get("/materials", getAllMaterials);
router.get("/materials/:id", getMaterialById);
router.put("/materials/:id", updateMaterial);
router.delete("/materials/:id", deleteMaterial);

// Manpower Routes
router.post("/manpower", createManpower);
router.get("/manpower", getAllManpower);
router.get("/manpower/:id", getManpowerById);
router.put("/manpower/:id", updateManpower);
router.delete("/manpower/:id", deleteManpower);

// Machine Routes
router.post("/machines", createMachine);
router.get("/machines", getAllMachines);
router.get("/machines/:id", getMachineById);
router.put("/machines/:id", updateMachine);
router.delete("/machines/:id", deleteMachine);

export { router as projectRoutes }