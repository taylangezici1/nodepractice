const express = require("express")
const router = express.Router()
const Collection = require("../models/collection")

router.get("/", async (req,res) => {
    try{
        const collections = await Collection.find()
        res.json(collections)
    }
    catch(err){
        res.status(500).json({message : err.messsage})
    }
})


module.exports = router