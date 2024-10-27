import express from 'express'
import { getCostumer, postCustomer, editCustomer, getCustomerNameById, getCustomerIdByName, getCustomerById, delCustomer, sDelCustomer, getCostumerArc, restoreCustomer } from '../controller/costumerController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// get all costumer route
router.get('/', auth, getCostumer)

// get all archived opp route
router.get('/archives', auth, getCostumerArc) 

// get costumer name by id route
router.get('/:id', auth, getCustomerNameById)

// get costumer name by id route
router.get('/getId/:name', auth, getCustomerIdByName)

// get costumer by id route
router.get('/getCustId/:id', auth, getCustomerById)

// add costumer
router.post('/', auth, postCustomer)

// edit customer
router.put('/up/:id', auth, editCustomer)

// hard delete route
router.delete('/del/:id', auth, delCustomer)

// soft delete
router.put('/archive/:id', auth, sDelCustomer)

// soft delete
router.put('/restore/:id', auth, restoreCustomer)

export { router as costumerRoutes}