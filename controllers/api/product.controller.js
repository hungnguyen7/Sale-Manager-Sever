const mongoose = require('mongoose')
const Customer = require('../../models/customer.model');
const Product = require('../../models/product.model')
module.exports={
    getProducts: async(req, res)=>{
        try{
            let products = await Product.find({}).sort({
                "classification.type": 1
            });
            res.status(200).json(products)
        }catch(error){
            res.status(404).send(error)
        }
    },
    getProductById: async(req, res)=>{
        try{
            let product = await Product.findOne({
                _id: req.params.productId
            });
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
        //Chỉ tạo tên product
        try{
            let existProduct = await Product.findOne({
                name: req.body.name.toUpperCase()
            })
            if(!existProduct)
                await Product.create({
                    name: req.body.name.toUpperCase()
                })
            else
                throw {
                    status: 'Product is existed'
                }
            res.status(201).send({
                status: "Created Successfully"
            })
        }catch(error){
            res.status(400).send(error)
        }
    },
    addType: async(req, res)=>{
        //Add type of product
        try{
            let statusAddType = await Product.findOneAndUpdate({
                _id: req.params.productId,
                'classification.type': {
                    $ne: req.body.type
                }
            },
            {
                $push:{
                    classification:{
                        type: req.body.type,
                        amount: req.body.amount,
                        purchasePrice: req.body.purchasePrice,
                        salePrice: req.body.salePrice
                    }
                }
            },
            {
                runValidators: true
            })
            if(statusAddType)
                res.status(200).send({
                    status: 'Add type of product successfully'
                })
            else
                throw {
                    status: 'Type is existed'
                }
        }catch(error){
            res.status(404).send(error)
        }
    },
    deleteOneProduct: async(req, res)=>{
        try{
            await Product.findByIdAndDelete({
                _id: req.params.productId
            })
            res.status(200).send({
                status: "Deleted product successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    deleteOneTypeOfProduct: async(req, res)=>{
        try{
            let typeIsDeleted = await Product.findOneAndUpdate({
                _id: req.params.productId,
                'classification.type': parseInt(req.params.type)
            },{
                $pull:{
                    classification:{                    
                        type: parseInt(req.params.type)
                    }
                }
            }, 
            {
                runValidators: true,
                new: true
            })
            if(!typeIsDeleted)
                throw {
                    status: "Type is not existed"
                }
            await Customer.updateMany({}, {
                $pull:{
                    cart:{
                        productId: req.params.productId,
                        type: parseInt(req.params.type)
                    }
                }
            })
            console.log(typeIsDeleted)
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
            //Sử dụng aggregate framework pipeline
            let productOnStore = await Product.aggregate([
                //Find by Id->Get classification field->unwind->Find by type
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.params.productId)
                    }
                },
                {
                    $project:{
                        classification: 1
                    }
                },
                {
                    $unwind: '$classification'
                },
                {
                    $match:{
                        'classification.type': parseInt(req.body.type)
                    }
                }
            ])
            console.log(productOnStore)
            res.status(200).send({
                status: "Edited successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }      
    }
}
