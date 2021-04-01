const Customer = require('../../models/customer.model')
const Product = require('../../models/product.model');
module.exports = {
    getCustomers: async(req, res)=>{
        try{
            let customers = await Customer.find({},{
                //Không lấy field cart
                cart: 0
            });
            res.status(200).json(customers)
        }catch(error){
            res.status(404).send(error)
        }
    },
    getCustomerById: async(req, res)=>{
        try{
            let customer = await Customer.findOne({
                _id: req.params.customerId
            });
            if(!customer)
                throw {
                    status: "Customer is not found"
                }
            res.status(200).json(customer)
        }catch(error){
            res.status(404).send(error)
        }  
    },
    createCustomer: async(req, res)=>{
        try{
            let customer = await Customer.findOne({
                name: req.body.name.toUpperCase()
            })
            if(!customer){
                await Customer.create({
                    name: req.body.name.toUpperCase(),
                    phone: req.body.phone,
                    address: req.body.address
                })
            }
            else{
                throw {
                    status: "Customer is existed"
                }
            }
            res.status(201).send({
                status: "Created customer successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    deleteOneUser: async(req, res)=>{
        try{
            //Lấy các deal Id
            let userWillBeDeleted = await Customer.findById({
                _id: req.params.customerId
            })
            await Promise.all(userWillBeDeleted.cart.map(async (element)=>{
                return deleteDealById(element._id)
            }))
            await Customer.findByIdAndDelete({
                _id: req.params.customerId
            })
            res.status(200).send({
                status: "Deleted customer Successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    editCustomer: async(req, res)=>{
        try{
            let customer = await Customer.findOneAndUpdate({
                _id: req.params.customerId
            },
            {
                $set: req.body
            },
            {
                new: true
            })
            if(!customer)
                throw{
                    status: "Customer is not existed"
                }
            res.status(200).send({
                status: "Edited successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    getCart: async(req, res)=>{
        try{
            //Chỉ lấy field cart
            let stockInCart = await Customer.findById(req.params.customerId, 'cart').populate('cart.productId')
            if(!stockInCart)
                throw {
                    status: 'Customer is not valid'
                }
            res.status(200).json(stockInCart)
        }catch(error){
            res.status(404).send(error)
        }
    },
    addToCart: async(req, res)=>{
        try{
            //Kiểm tra sản phẩm có trong giỏ hàng chưa, nếu chưa thì tùy vào buyInto mà thêm vào
            let existProductInCart = await Customer.findOne({
                _id: req.params.customerId,
                cart: {
                    $elemMatch:{
                    productId: req.body.productId,
                    type: req.body.type,
                    buyInto: req.body.buyInto
                    }
                }
            })
            if(!existProductInCart){
                if(!req.body.buyInto){
                    let productInStore = await Product.findOneAndUpdate({
                        _id: req.body.productId,
                        classification: {
                            $elemMatch:{
                                type: req.body.type,
                                amount: {
                                    $gte: req.body.amount
                                }
                            }
                        }
                    },
                    {
                        $inc:{
                            'classification.$.amount':-req.body.amount
                        }
                    })
                    if(!productInStore)
                        throw {
                            status: "Cannot buying. Amount or type is not valid"
                        }
                    await Customer.findOneAndUpdate({
                        _id: req.params.customerId,
                    },
                    {
                        $push:{
                            cart:req.body
                        }
                    })
                }
                else{
                   
                    let productInStore = await Product.findOneAndUpdate({
                        _id: req.body.productId,
                        "classification.type": req.body.type
                    },
                    {
                        $inc:{
                            "classification.$.amount": req.body.amount
                        }
                    },{
                        runValidators: true
                    })
                    if(!productInStore)
                        throw {
                            status: "Cannot selling. Amount or type is not valid"
                        }
                    await Customer.findOneAndUpdate({
                        _id: req.params.customerId,
                    },
                    {
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
            deleteDealById(req.params.dealId)
            res.status(200).send({
                status: "Deleted deal successfully"
            })
        }catch(error){
            res.status(404).send(error)
        }
    },
    getSeller: async(req, res)=>{
        try{
            let sellerList = await Customer.find({
                'cart.buyInto': true
            })
            res.status(200).json(sellerList)
        }catch(error){
            console.log(error)
        }
    },
    getBuyer: async(req, res)=>{
        try{
            let sellerList = await Customer.find({
                'cart.buyInto': false
            })
            res.status(200).json(sellerList)
        }catch(error){
            console.log(error)
        }
    },
    getBill: async(req, res)=>{
        try{
            let stockInCart = await Customer.findById(req.params.customerId, 'cart').populate('cart.productId')
            let count = 0
            stockInCart.cart.forEach(element => {
                let type = element.type
                let buyInto = element.buyInto
                let inStore = element.productId.classification.filter(value=>value.type===type)
                if(buyInto)
                    count-=element.amount*inStore[0].purchasePrice
                else
                    count+=element.amount*inStore[0].salePrice
            })
            res.status(200).json({
                customerId: req.params.customerId,
                totalPrice: count
            })
        }catch(error){
            res.status(404).send(error)
        }
        
    }
}

const deleteDealById = async dealId =>{
    let deletedDeal = await Customer.findOneAndUpdate({
        'cart._id': dealId
    },
    {
        $pull:{
            cart:{
                _id: dealId
            }
        }
    },
    {
        'cart.$': 1
    })
    if(!deletedDeal)
        throw{
            status:"Deal is not existed"
        }
    //Lấy product trong cart bị xóa thêm lại vào store
    let productHasBeenDeleted = deletedDeal.cart[0]
    let productInStore = await Product.findOne({
        _id: productHasBeenDeleted.productId,
        "classification.type": productHasBeenDeleted.type
    },
    {
        'classification.$': 1
    })
    let getAmountOfProduct = productInStore.classification[0].amount
    if(productHasBeenDeleted.buyInto){
        await Product.findOneAndUpdate({
            _id: productHasBeenDeleted.productId,
            "classification.type": productHasBeenDeleted.type
        },
        {
            $set:{
                "classification.$.amount": getAmountOfProduct-productHasBeenDeleted.amount
            }
        },
        {
            runValidators: true
        })
    }
    else{
        await Product.findOneAndUpdate({
            _id: productHasBeenDeleted.productId,
            "classification.type": productHasBeenDeleted.type
        },
        {
            $set:{
                "classification.$.amount": getAmountOfProduct+productHasBeenDeleted.amount
            }
        },{
            runValidators: true
        })
    }
}