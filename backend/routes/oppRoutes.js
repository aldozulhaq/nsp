import express from 'express'
import { addOpp, getOpp, getOppArc, getOppById, handoverOpp, hDelOpp, restoreOpp, sDelOpp, updateOpp } from '../controller/oppController.js'
import auth from "../middleware/auth.js"

const router = express.Router()

// get all opp route
router.get('/', auth, getOpp)

// get all archived opp route
router.get('/archives', auth, getOppArc) 

// get opp by id route
router.get('/:id', auth, getOppById) 

// post opp route
router.post('/', auth, addOpp)

// hard delete opp route
router.delete('/del/:id', auth, hDelOpp)

// soft delete opp route
router.put('/archive/:id', auth, sDelOpp)

router.put('/restore/:id', auth, restoreOpp)

router.put('/handover/:id', auth, handoverOpp)

// update opp route
router.put('/up/:id', auth, updateOpp)

export { router as oppRoutes }