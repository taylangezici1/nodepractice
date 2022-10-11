const express = require("express")
const router = express.Router()
const Request = require("../models/request")

router.get("/", async (req,res) => {
    try{
        const requests = await Request.find()
        if (!requests) {
            res.status(404).json({message : 'No requests found'})
        }
        res.json(requests)
    }
    catch(err){
        res.status(500).json({message : err.message})
    }
})

router.post("/", async (req,res) => {
    try {
        const request = new Request({
            collectionName : req.body.collectionName
        })
        await request.save()
        res.status(201).json({request})
    } catch (err) {
        res.status(500).json({message : err.message})
    }
})

module.exports = router