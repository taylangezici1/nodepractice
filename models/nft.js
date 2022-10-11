const mongoose = require("mongoose")

const nftSchema = new mongoose.Schema({
    tokenId:{
        type:Number,
        reqired:true
    },
    collectionName:{
        type:String,
        required:true
    },
    traits:{
        type:Object
    },
    createdDate:{
        type:Date,
        default:Date.now
    },
    rarityScore:{
        type:Number
    },
    uniqueField:{
        type:String,
        unique:true
    }
})

module.exports = mongoose.model("Nft",nftSchema)