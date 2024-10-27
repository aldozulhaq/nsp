import mongoose from "mongoose"
import Costumer from "../models/costumerModel.js";

const getCostumer = async (req, res) => {
    try{
        const costumers = await Costumer.find({ $or: [{deleted: false}, {deleted:null}] }).sort({ createdAt: "desc"})
        res.status(200).json({ costumers })
    }catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

const getCostumerArc = async (req, res) => {
    try{
        const costumers = await Costumer.find({ deleted: true }).sort({ createdAt: "desc"})
        res.status(200).json({ costumers })
    }catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

const getCustomerNameById = async (req, res) => {
    try{
        const customer = await Costumer.findById(req.params.id)
        res.status(200).json({customer : customer.name})
    } catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

const getCustomerIdByName = async (req, res) => {
    try{
        const customer = await Costumer.findOne({ name: req.params.name})
        console.log(customer)
        res.status(200).json({customer : customer._id})
    } catch(error) {
        res.status(500).json({ error: error.message})
    }
}

const getCustomerById = async (req, res) => {
    try{
        const customer = await Costumer.findById(req.params.id)
        console.log(customer)
        res.status(200).json({customer})
    } catch(error) {
        res.status(500).json({ error: error.message})
    }
}

const postCustomer = async (req, res) => {
    const {name, desc} = req.body

    if(!name){
        res.status(400).json({ error: "field Name is required"})
    }

    try{
        const customer = await Costumer.create({ name, desc, deleted:false })
        res.status(200).json({msg: 'Customer added', customer})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const editCustomer = async (req, res) => {
    const {name, desc} = req.body

    if(!name){
        res.status(400).json({ error: "field Name is required"})
    }

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const customer = await Costumer.findById(req.params.id)
    if (!customer) {
        return res.status(400).json({ error: "Customer not found"})
    }

    try{
        await customer.updateOne({ name, desc })
        res.status(200).json({msg: 'Customer updated', customer})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const delCustomer = async (req, res) => {
    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const customer = await Costumer.findById(req.params.id)
    if (!customer) {
        return res.status(400).json({ error: "Customer not found"})
    }

    try {
        await customer.deleteOne()
        res.status(200).json({msg: 'Customer deleted'})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const sDelCustomer = async (req, res) => {

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const customer = await Costumer.findById(req.params.id)
    if (!customer) {
        return res.status(400).json({ error: "Customer not found"})
    }

    try {
        await customer.updateOne({ deleted : true })
        return res.status(200).json({ success: "Customer archived", customer})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const restoreCustomer = async (req, res) => {

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const customer = await Costumer.findById(req.params.id)
    if (!customer) {
        return res.status(400).json({ error: "Customer not found"})
    }

    try {
        await customer.updateOne({ deleted : false })
        return res.status(200).json({ success: "Customer restored", customer})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

export { getCostumer, postCustomer, editCustomer, getCustomerNameById, getCustomerIdByName, getCustomerById, delCustomer, sDelCustomer, getCostumerArc, restoreCustomer }