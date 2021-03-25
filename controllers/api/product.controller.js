const Customer = require('../../models/customer.model');
const Product = require('../../models/product.model')
module.exports={
    getProducts: async(req, res)=>{
        try{
            let products = await Product.find({});
            res.status(200).json(products)
        }catch(error){
            res.status(404).send(error)
        }
    },
    getProductById: async(req, res)=>{
        try{
            let product = await Product.findOne({_id: req.params.productId});
            if(!product)
                throw {
                    status: "Product not found"
                }
            res.status(200).json(product)
        }catch(error){
            res.status(404).send(error)
        }  
    },
    createProduct: async(req, res)=>{
        try{
            let productSentFromClient = req.body
            let existProduct = await Product.findOne({name: productSentFromClient.name.toUpperCase()})
            if(!existProduct){
                await Product.create({
                    name: productSentFromClient.name.toUpperCase(),
                    classification:[{
                        type: productSentFromClient.type,
                        amount: productSentFromClient.amount,
                        purchasePrice: productSentFromClient.purchasePrice,
                        salePrice: productSentFromClient.salePrice
                    }]
                })
            }
            else{
                let existType =  await Product.updateOne({name: productSentFromClient.name.toUpperCase(), 'classification.type': {$ne: productSentFromClient.type}},
                    {
                        $push: {
                            classification:{
                                type: productSentFromClient.type,
                                amount: productSentFromClient.amount,
                                purchasePrice: productSentFromClient.purchasePrice,
                                salePrice: productSentFromClient.salePrice
                            }
                        }
                    })
                if(existType.nModified===0)
                    throw {
                        status: "Could not be created because the type in use was in use"
                    }
                
            }
            res.status(201).send({
                status: "Created Successfully"
            })
        }catch(error){
            res.status(400).send(error)
        }
    },
    deleteOneProduct: async(req, res)=>{
        try{
            await Product.findByIdAndDelete({_id: req.params.productId})
            res.status(200).send({
                status: "Deleted Successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    deleteOneTypeOfProduct: async(req, res)=>{
        let checkValidType = [1, 2, 3].filter(value=>value===parseInt(req.params.type))
        try{
            if(checkValidType.length===0){
                throw "Invalid type"
            }
            await Product.findByIdAndUpdate(req.params.productId,{
                $pull:{
                    classification:{                    
                        type: parseInt(req.params.type)
                    }
                }
            }, {new: true})
            await Customer.updateMany({}, {
                $pull:{
                    cart:{
                        productId: req.params.productId,
                        type: parseInt(req.params.type)
                    }
                }
            })
            console.log(test)
            res.status(200).send({
                status: "Deleted one type of product successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    editProduct: async(req, res)=>{
        try{
            let keySentFromClient = Object.keys(req.body)
            let productOnStore = await Product.findOne({_id: req.params.productId, "classification.type": req.body.type})
            if(!productOnStore)
                throw {
                    status: "Product is not existed"
                }
            productOnStore=productOnStore.classification.filter(product=>product.type===req.body.type)[0]
            let userSubmittedKeysAreMissing = Object.keys(productOnStore._doc).filter(key=>keySentFromClient.indexOf(key)<0)
            userSubmittedKeysAreMissing.map(key=>req.body[key]=productOnStore[key])
            await Product.findOneAndUpdate({_id: req.params.productId, "classification.type": req.body.type}, {
                $set:{
                        "classification.$": req.body
                }
            }, {new: true})
            res.status(200).send({
                status: "Edited successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }      
    }
}
