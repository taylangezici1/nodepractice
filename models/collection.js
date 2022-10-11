const mongoose = require("mongoose")

const collectionSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    contractAddress:{
        type:String,
        unique:true,

        required:true
    },
    rarityScoresGiven:{
        type:Boolean,
        required:true,
        default:false
    },
    totalSupply:{
        type:Number,
        required:true
    },
    createdDate:{
        type:Date,
        required:true,
        default:Date.now
    },
    updatedDate:{
        type:Date,
        required:false
    },
    traits:{
        type:Object
    },
    requestId:{
        type:String,
        reqired:true
    }

})

module.exports = mongoose.model("Collection",collectionSchema)