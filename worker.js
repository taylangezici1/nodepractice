require("dotenv").config()
const axios = require("axios")
const moment = require("moment")
const Collection = require("./models/collection")
const Nft = require("./models/nft")
const Request = require("./models/request")

const mongoose = require("mongoose")
mongoose.connect(process.env.mongo_url)
const db = mongoose.connection
db.on("error", (error) => console.error(error))
db.once("open", () => console.log("Connected to mongo"))
// const MongoServerError = require("mongodb-core").MongoServerError

const apiKey = process.env.api_key

const GetCollectionInfo = async (collectionName) => { // is there a difference between this and 'async function GetCollectionInfo(collectionName){'?
    const existCollection = await Collection.findOne({name:collectionName})
    let collection = new Collection()
    const response = await axios.get(`https://api.opensea.io/api/v1/collection/${collectionName}`)
    if(response.status == 200){
        collection = new Collection({
            name:collectionName,
            contractAddress:response["data"]["collection"]["primary_asset_contracts"][0]["address"],
            totalSupply:response["data"]["collection"]["stats"]["total_supply"]
        })
        await GetCollectionTraits(collection,response.data.collection.traits)
        await AssignTraitScores(collection)
    }
    
    if(!existCollection){
        await collection.save()
        return collection
    }

    if(collection['traits'] !== existCollection['traits']){
        await Collection.updateOne({id:existCollection['id']},{traits:collection['traits'],updatedDate:moment().format()})
    }
    return collection
  }

async function AssignNftScore(traitScores,nft){
    var rarityScore = 0
    var nftTraits= []
    for(trait of  nft['traits']){
        let traitScore = traitScores[trait['trait_type']][trait['value'].toLowerCase()]
        rarityScore += traitScore
        trait['rarity_score'] = traitScore
        nftTraits.push(trait['trait_type'])
    }
    for ([key,value] of Object.entries(traitScores)){
        if (nftTraits.includes(key)) {
            continue
        }
        let traitScore = traitScores[key]['NonExistent']
        rarityScore += traitScore
        nft['traits'].push({
            trait_type:key,
            value:"NonExistent",
            rarity_score:traitScore
        })
    }
    nft['rarityScore'] = rarityScore
}

async function GetTokenInfo(collection,tokenId){
    const response = await axios.get(`https://api.opensea.io/api/v1/asset/${collection['contractAddress']}/${tokenId}/?include_orders=true`,{
        headers:{
        "x-api-key":apiKey
    }})

    
    let nft = new Nft({
        tokenId:parseInt(response['data']['token_id']),
        collectionName:collection['name'],
        traits:response['data']['traits'],
        uniqueField: `${collection['name']}-${response['data']['token_id']}`
    })
    await AssignNftScore(collection['traitScores'],nft)
    return nft
    
}

async function AssignTraitScores(collection){
    let allTraitScores = new Object()
    for ([type,trait] of Object.entries(collection['traits'])){
        let meanAvg = collection['totalSupply'] / Object.keys(trait).length
        var stdDev = 0;
        for ([traitKey,traitValue] of Object.entries(trait)){
            stdDev += Math.pow((traitValue - meanAvg),2)
        }
        stdDev = Math.sqrt(stdDev / Object.keys(trait).length - 1)
        var r = new Object()
        for ([traitKey,traitValue] of Object.entries(trait)){
            var rarityScore = (1 / traitValue / collection['totalSupply']) * stdDev * 100000
            r[traitKey] = parseFloat(rarityScore.toFixed(2))
        }
        allTraitScores[type] = r 
    }
    collection['traitScores'] = allTraitScores
}


async function GetCollectionTraits(collection,allTraits){
    for (traitKey in allTraits){
        var totalCount = 0
        for (traitValue in allTraits[traitKey]){
            totalCount += allTraits[traitKey][traitValue]
        }
        if(totalCount < collection.totalSupply){
            allTraits[traitKey]["NonExistent"] = collection.totalSupply - totalCount
        }
    }
    collection["traits"] = allTraits
}

async function Main(){
    let request = await Request.findOne({completed:false})
    if (request) {
        let collection = await GetCollectionInfo(request['collectionName'])
        console.info("collection is done")
        for (let i = 0; i < collection['totalSupply']; i++){
            if (i % 20 === 0) {
                console.info(`${i} info done`)
            }
            let nft = await GetTokenInfo(collection,i)
            try {
                await nft.save()
            } 
            catch (err) {
                // if (err instanceof MongoServerError) {
                //     console.log("nft already exists")
                // }
                console.log(err.message)
            }   
        }
        await request.update({completed:true})
    }
}
// async function Test(){
//     var a = new Request({collectionName:"kaiju-kingz"})
//     await a.save()
//     let collection = await GetCollectionInfo("kaiju-kingz")
//     var anan = await GetTokenInfo(collection,3333)
//     let x = 3
// }
Main()
// setInterval(Main,300000)
