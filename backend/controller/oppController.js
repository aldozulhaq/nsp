import mongoose from "mongoose"
import Opp from "../models/oppModel.js"
import User from "../models/userModel.js"
import Customer from "../models/costumerModel.js"
import Project from "../models/projectModel.js"
/**
 * Get all data (not archived) from main opportunity table
 */
const getOpp = async (req, res) => {
    try {
        const opps = await Opp.find({ deleted: false }).sort({ no: "desc"})
        res.status(200).json({ opps })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getOppById = async (req, res) => {
    try{
        const opp = await Opp.findById(req.params.id)
        res.status(200).json({opp})
    } catch(error)
    {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Get archived data from main opportunity table
 */
const getOppArc = async (req, res) => {
    try {
        const opps = await Opp.find({ deleted: true }).sort({ no: "desc"})
        res.status(200).json({ opps })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Creating / adding new data to main opportunity table
 */
const addOpp = async (req, res) => {

    // Grab data from req
    const {
        customer_name,
        opportunity_name,
        closing_date,
        firm_budgetary,
        opp_status,
        nilai,
        gm,
        ntp,
        probability,
        keterangan
    } = req.body

    // Check if empty
    if(!customer_name ||
        !opportunity_name ||
        !closing_date ||
        !firm_budgetary ||
        !opp_status
    ){
        return res.status(400).json({ error: "All fields are required"})
    }

    // Check if customer exist
    const customer = Customer.findById(req.customer_name)
    if(!customer)
    {
        return res.status(400).json({ error: "Customer doesn't exist"})
    }

    // Grab authenticated user from request body
    const user = await User.findById(req.user._id)

    const opps = await Opp.find({ deleted: false }).sort({ no: "desc"})
    const noCount = ({opps}.opps[0].no + 1)

    function romanize (num) {
        if (!+num)
            return false;
        var digits = String(+num).split(""),
            key    = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                      "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                      "","I","II","III","IV","V","VI","VII","VIII","IX"],
            roman  = "",
            i      = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return Array(+digits.join("") + 1).join("M") + roman;
    }

    const date = new Date()
    const noOpp = "100" + (0 + (date.getMonth() + 1).toString().slice(-2)) + date.getFullYear().toString().slice(-2) + "0" + noCount
    const noProp = "PEN-NSP-" + date.getFullYear().toString() + "/"+ romanize(date.getMonth() + 1) + "/" + noCount + "_R00"

    try{
        const opp = await Opp.create( {
            no: noCount,
            no_opportunity: noOpp,
            created_by: user._id,
            customer_name,
            opportunity_name,
            sic: user._id,
            closing_date,
            no_proposal: noProp,
            firm_budgetary,
            opp_status,
            nilai,
            gm,
            ntp,
            probability,
            keterangan,
            deleted:false,
            handover_status:"" } )
        
        res.status(200).json({msg: 'Opportunity created', opp})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



/**
 * Hard delete (actually remove) data from main opportunity table
 */

const hDelOpp = async (req, res) => {
    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const opp = await Opp.findById(req.params.id)
    if (!opp) {
        return res.status(400).json({ error: "OPP not found"})
    }

    try {
        await opp.deleteOne()
        res.status(200).json({msg: 'Opportunity deleted'})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Soft delete (hid) data from main opportunity table
 */
const sDelOpp = async (req, res) => {

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const opp = await Opp.findById(req.params.id)
    if (!opp) {
        return res.status(400).json({ error: "OPP not found"})
    }

    try {
        await opp.updateOne({ deleted : true })
        return res.status(200).json({ success: "OPP archived", opp})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const restoreOpp = async (req, res) => {

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const opp = await Opp.findById(req.params.id)
    if (!opp) {
        return res.status(400).json({ error: "OPP not found"})
    }

    try {
        await opp.updateOne({ deleted : false })
        return res.status(200).json({ success: "OPP restored", opp})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

const handoverOpp = async (req, res) => {

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // const {
    //     master_costs
    // } = req.body;

    // Check if data exists
    const opp = await Opp.findById(req.params.id)
    if (!opp) {
        return res.status(400).json({ error: "OPP not found"})
    }

    // if(!master_costs)
    // {
    //     return res.status(400).json({ error: "Master Costs not found"})
    // }

    try {
        await opp.updateOne({ handover_status : "Finished" })
        const project = await Project.create({
            opp_ref: opp._id,
            no_project: 'Unnumbured',
            customer_name: opp.customer_name,
            project_name: opp.opportunity_name,
            nilai: opp.nilai,
            gm: opp.gm,
            deleted: false,
            //master_costs
         })
        return res.status(200).json({ success: "OPP Handed Over", opp, project})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Update data from main opportunity table
 */
const updateOpp = async (req, res) => {
    // Get data from req body
    const {
        customer_name,
        opportunity_name,
        sic,
        closing_date,
        no_proposal,
        firm_budgetary,
        opp_status,
        nilai,
        gm,
        ntp,
        probability,
        keterangan
    } = req.body = req.body

    // Check if empty
    if(!customer_name ||
        !opportunity_name ||
        !sic ||
        !closing_date ||
        !firm_budgetary ||
        !opp_status
    ){
        return res.status(400).json({ error: "All fields are required"})
    }

    // Check if ID is a valid data type
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID not found / Incorrect ID"})
    }

    // Check if data exists
    const opp = await Opp.findById(req.params.id)
    if (!opp) {
        return res.status(400).json({ error: "OPP not found"})
    }

    var hos = ''
    if(opp_status == 'Won' && opp.opp_status == 'Won'){
        hos = opp.handover_status
    } else if(opp_status != 'Won' && opp.opp_status == 'Won'){
        hos = ''
    } else if(opp_status == 'Won') {
        hos = 'Pending'
    }
    
    try {
        const dataOpp = await opp.updateOne({ customer_name,
            opportunity_name,
            sic,
            closing_date,
            no_proposal,
            firm_budgetary,
            opp_status,
            nilai,
            gm,
            ntp,
            probability,
            keterangan,
            handover_status:hos
        })

        const dataProject = await Project.updateMany(
            { opp_ref: opp._id },  // Find all projects where opp_ref matches the updated opp._id
            {
                project_name: opportunity_name,
                customer_name: customer_name,
                nilai: nilai,
                gm: gm,
            }
        );

        return res.status(200).json({ success: "OPP updated", dataOpp, dataProject})
    } catch(error) {
        res.status(500).json({ error: error.message })
    }
}

export { getOpp, getOppArc, addOpp, hDelOpp, sDelOpp, updateOpp, getOppById, restoreOpp, handoverOpp }