const Customer = require('../../models/customer.model')
const Product = require('../../models/product.model');
module.exports = {
    getCustomers: async(req, res)=>{
        try{
            let customers = await Customer.find({});
            res.status(200).json(customers)
        }catch(error){
            res.status(404).send(error)
        }
    },
    getCustomerById: async(req, res)=>{
        try{
            let customer = await Customer.findOne({_id: req.params.customerId});
            if(!customer)
                throw {
                    status: "Customer not found"
                }
            res.status(200).json(customer)
        }catch(error){
            res.status(404).send(error)
        }  
    },
    createCustomer: async(req, res)=>{
        try{
            customerSentFromClient = req.body
            let existCustomer = await Customer.findOne({name: customerSentFromClient.name.toUpperCase()})
            if(!existCustomer){
                await Customer.create({
                    name: customerSentFromClient.name.toUpperCase(),
                    phone: customerSentFromClient.phone
                })
            }
            else{
                throw {
                    status: "Customer existed."
                }
            }
            res.status(201).send({
                status: "Created successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    deleteOneUser: async(req, res)=>{
        try{
            await Customer.findByIdAndDelete({_id: req.params.customerId})
            res.status(200).send({
                status: "Deleted Successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    editCustomer: async(req, res)=>{
        console.log(req.params, req.body)
        try{
            let customerOnDB = await Customer.findOne({_id: req.params.customerId})
            if(!customerOnDB)
                throw{
                    status: "Customer is not existed"
                }
            await Customer.findOneAndUpdate({_id: req.params.customerId},{$set: req.body}, {new: true})
            res.status(200).send({
                status: "Edited successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    getCart: async(req, res)=>{
        try{
            let customerId = req.params.customerId
            let stockInCart = await Customer.findById(customerId).populate('cart.productId')
            if(!stockInCart)
                throw {
                    status: 'Customer is not valid'
                }
            //Thay đổi _doc của stockInCart
            stockInCart._doc.cart.forEach(el=>{
                delete el._doc.productId._doc.classification
            })
            res.status(200).json(stockInCart.cart)
        }catch(error){
            res.status(404).send(error)
        }
    },
    addToCart: async(req, res)=>{
        try{
            let existProductInCart = await Customer.findOne({
                _id: req.params.customerId,
                cart: {$elemMatch:{
                    productId: req.body.productId,
                    type: req.body.type,
                    buyInto: req.body.buyInto
                }}
              
            })
            if(!existProductInCart){
                if(!req.body.buyInto){
                    let productInStore = await Product.findOne({
                        _id: req.body.productId,
                        classification: {$elemMatch:{
                            type: req.body.type,
                            amount: {
                                $gte: req.body.amount
                            }
                        }}
                    })
                    if(!productInStore)
                        throw {
                            status: "Amount is not valid"
                        }
                    let getAmountOfProduct = productInStore.classification[0].amount
                    await Product.findOneAndUpdate({
                        _id: req.body.productId,
                        "classification.type": req.body.type
                    },{
                        $set:{
                            "classification.$.amount": getAmountOfProduct-req.body.amount
                        }
                    })
                    await Customer.findOneAndUpdate({
                        _id: req.params.customerId,
                    },{
                        $push:{
                            cart:req.body
                        }
                    })
                }
                else{
                    let productInStore = await Product.findOne({
                        _id: req.body.productId,
                        "classification.type": req.body.type
                    })
                    if(!productInStore)
                        throw {
                            status: "Something wrong in parament"
                        }
                    let getAmountOfProduct = productInStore.classification[0].amount
                    await Product.findOneAndUpdate({
                        _id: req.body.productId,
                        "classification.type": req.body.type
                    },{
                        $set:{
                            "classification.$.amount": getAmountOfProduct+req.body.amount
                        }
                    })
                    await Customer.findOneAndUpdate({
                        _id: req.params.customerId,
                    },{
                        $push:{
                            cart:req.body
                        }
                    })
                }
                res.status(200).send({
                    status: "Added product successfully"
                })
            }
            else{
                throw {
                    status: "Product already existed"
                }
            }
        }catch(error){
            res.status(404).send(error)
        }
    },
    deleteDealById: async(req, res)=>{
        try{
            let deletedDeal = await Customer.findOneAndUpdate({
                "cart._id": req.params.dealId
            },{
                $pull:{
                    cart:{
                        _id: req.params.dealId
                    }
                }
            })
            if(!deletedDeal)
                throw{
                    status:"Deal is not existed"
                }
            //Lấy product bị xóa thêm lại vào store
            let productHasBeenDeleted = deletedDeal.cart.filter(deal=>deal._id.toString()===req.params.dealId)[0]
            let productInStore = await Product.findOne({
                _id: productHasBeenDeleted.productId,
                "classification.type": productHasBeenDeleted.type
            })
            let getAmountOfProduct = productInStore.classification[0].amount
            if(productHasBeenDeleted.buyInto){
                await Product.findOneAndUpdate({
                    _id: productHasBeenDeleted.productId,
                    "classification.type": productHasBeenDeleted.type
                },{
                    $set:{
                        "classification.$.amount": getAmountOfProduct-productHasBeenDeleted.amount
                    }
                })
            }
            else{
                await Product.findOneAndUpdate({
                    _id: productHasBeenDeleted.productId,
                    "classification.type": productHasBeenDeleted.type
                },{
                    $set:{
                        "classification.$.amount": getAmountOfProduct+productHasBeenDeleted.amount
                    }
                })
            }
            res.status(200).send({
                status: "Deleted deal successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    getSeller: async(req, res)=>{
        try{
            let sellerList = await Customer.find({'cart.buyInto': true})
            res.status(200).json(sellerList)
        }catch(error){
            console.log(error)
        }
    },
    getBuyer: async(req, res)=>{
        try{
            let sellerList = await Customer.find({'cart.buyInto': false})
            res.status(200).json(sellerList)
        }catch(error){
            console.log(error)
        }
    }
}
