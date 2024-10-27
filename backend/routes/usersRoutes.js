import express from 'express'
import { regUser, loginUser, getSicNameById, getUsersArc, getSicByEmail, getEmailById, changePassword, sDelUser, hDelUser, restoreUser, getUsers, editUser } from '../controller/userController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Register user route
router.post('/', auth, regUser)

// Login user route
router.post('/login', loginUser)

router.get('/', auth, getUsers)

router.get('/archives', auth, getUsersArc)

// get user name by id route
router.get('/:id', auth, getSicNameById)

// get user name and id by email
router.get('/email/:email', auth, getSicByEmail)

// get user name and id by email
router.get('/getEmail/:id', auth, getEmailById)

router.put('/up/:id', auth, editUser)

// change password
router.put('/changePW/:id', auth, changePassword)

router.put('/archive/:id', auth, sDelUser)

router.put('/restore/:id', auth, restoreUser)

router.delete('/del/:id', auth, hDelUser)

export { router as userRoutes}