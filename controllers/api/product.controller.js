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
            let productOnStore = await Product.findOne({
                _id: req.params.productId,
                "classification.type": req.body.type
            }, 
            {
                //Chỉ lấy các nested object matched
                'classification.$': req.body.type
            },
            {
                runValidators: true
            })
            if(!productOnStore)
                throw {
                    status: "Product is not existed or type is not valid"
                }
            productOnStore = productOnStore.classification[0].toObject()
            delete productOnStore._id
            //Lấy type của product trong store trùng với người dùng gửi lên
            let userSubmittedKeysAreMissing = Object.keys(productOnStore).filter(key=>keySentFromClient.indexOf(key)<0)
            //Lấy các field mà người dùng gửi thiếu thêm vào req.body
            userSubmittedKeysAreMissing.map(key=>req.body[key]=productOnStore[key])
            // Không cho phép sửa số lượng tồn kho khi đã tạo, tránh trường hợp xóa khối lượng nhưng hóa đơn người dùng vẫn còn
            req.body.amount = productOnStore.amount
            await Product.findOneAndUpdate({
                _id: req.params.productId,
                "classification.type": req.body.type
            },
            {
                $set:{
                        "classification.$": req.body
                }
            }, 
            {
                runValidators: true
            })
            res.status(200).send({
                status: "Edited successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }      
    }
}
