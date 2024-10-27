import User from '../models/userModel.js'
import crypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config.js'
import mongoose from 'mongoose'

/**
 * Creating JWT (Json Web Token)
 */
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '10d' })
}

/**
 * Register User
 */
const regUser = async (req, res) => {
    // Grab data from req.body
    const { username, email, password, role } = req.body

    // Check if fields are empty
    if(!username || !email || !password || !role)
    {
        return res.status(400).json({ error: "All fields are required"})
    }

    // Check if username already exist
    const exist = await User.findOne({ username })
    if (exist) {
        return res.status(400).json({ error: "Username already exist" })
    }

    // Check if email already exist
    const emailexist = await User.findOne({ email })
    if (emailexist) {
        return res.status(400).json({ error: "Email already exist" })
    }

    // Hash password
    const salt = await crypt.genSalt()
    const hashedPW = await crypt.hash( password, salt)

    try {
        const user = await User.create({ username, email, password : hashedPW, role, deleted:false })
        
        // Create the JWT
        const token = createToken(user._id)
        
        res.status(200).json({ email, token })
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const changePassword = async (req, res) => {
    const { password } = req.body
    const { authorization } = req.headers
    
    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const sic = await User.findById(req.params.id)
    if (!sic) {
        return res.status(400).json({ error: "User not found"})
    }

    // Hash password
    const salt = await crypt.genSalt()
    const hashedPW = await crypt.hash( password, salt)

    // Grab the token from headers (taking the "Bearer " string away)
    const token = authorization.split(" ")[1]
    // Decode and extract the user id from token
    const {_id} = jwt.verify(token, process.env.SECRET)

    try{
        await sic.updateOne({password: hashedPW})
        return res.status(200).json({ success: "Password updated", sic})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const editUser = async (req, res) => {
    const { username, email, role } = req.body
    const { authorization } = req.headers
    
    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const sic = await User.findById(req.params.id)
    if (!sic) {
        return res.status(400).json({ error: "User not found"})
    }

    // Check if username already exist
    const exist = await User.findOne({ username })
    if (exist && sic.username !== exist.username) {
        return res.status(400).json({ error: "Username already exist" })
    }

    // Check if email already exist
    const emailexist = await User.findOne({ email })
    if (emailexist && sic.email !== emailexist.email) {
        return res.status(400).json({ error: "Email already exist" })
    }

    // Grab the token from headers (taking the "Bearer " string away)
    const token = authorization.split(" ")[1]
    // Decode and extract the user id from token
    const {_id} = jwt.verify(token, process.env.SECRET)

    try{
        await sic.updateOne({username, email, role})
        return res.status(200).json({ success: "User Updated", sic})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Login User
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body

    // Check if fields are empty
    if(!email || !password)
    {
        return res.status(400).json({ error: "All fields are required"})
    }

    // Check if email exist
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400).json({ error: "Email incorrect / doesn't exist" })
    }

    if(user.deleted) {
        return res.status(400).json({ error: "User does not have permission to log in" })
    }

    // Check password
    const match = await crypt.compare( password, user.password )
    if(!match) {
        return res.status(400).json({ error: "Incorrect password" })
    }
    
    try {
        // Create the JWT
        const token = createToken(user._id)
        
        res.status(200).json({ email, username: user.username, role: user.role, token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getSicNameById = async (req, res) => {
    try{
        const sic = await User.findById(req.params.id)
        res.status(200).json({sic : sic.username})
    } catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

const getSicByEmail = async (req, res) => {
    try{
        const sic = await User.findOne({email: req.params.email})
        res.status(200).json({name: sic.username, _id: sic._id})
    } catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

const getEmailById = async (req, res) => {
    try{
        const sic = await User.findById(req.params.id)
        res.status(200).json({email: sic.email})
    } catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

const getUsersArc = async (req, res) => {
    try{
        const users = await User.find({deleted:true}).sort({ createdAt: "desc"})
        res.status(200).json({ users })
    }catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

const getUsers = async (req, res) => {
    try{
        const users = await User.find({$or: [{deleted: false}, {deleted:null}]}).sort({ createdAt: "desc"})
        res.status(200).json({ users })
    }catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Hard delete (actually remove) data from main opportunity table
 */

const hDelUser = async (req, res) => {
    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(400).json({ error: "User not found"})
    }

    try {
        await user.deleteOne()
        res.status(200).json({msg: 'User deleted'})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Soft delete (hid) data from main opportunity table
 */
const sDelUser = async (req, res) => {

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(400).json({ error: "User not found"})
    }

    try {
        await user.updateOne({ deleted : true })
        return res.status(200).json({ success: "User archived", user})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const restoreUser = async (req, res) => {

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(400).json({ error: "User not found"})
    }

    try {
        await user.updateOne({ deleted : false })
        return res.status(200).json({ success: "User restored", user})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

export { regUser, loginUser, getSicNameById, getUsersArc, getSicByEmail, getEmailById, changePassword, hDelUser, sDelUser, restoreUser, getUsers, editUser }