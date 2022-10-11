const mongoose = require("mongoose")

const requestSchema = new mongoose.Schema({
    collectionName:{
        type:String,
        unique:true,
        required:true
    },
    completed:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model("Request",requestSchema)