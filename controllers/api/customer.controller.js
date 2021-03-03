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
            let keySentFromClient = Object.keys(req.body)
            let customerOnDB = await Customer.findOne({_id: req.params.customerId})
            console.log(customerOnDB)
            // if(!customerOnDB)
            //     throw{
            //         status: "Customer is not existed"
            //     }
            let customerKey = ['name', 'phone']
            let userSubmittedKeysAreMissing = customerKey.filter(key=>keySentFromClient.indexOf(key)<0)
            console.log(userSubmittedKeysAreMissing)
            userSubmittedKeysAreMissing.map(key=>req.body[key]=customerOnDB[key])
            console.log(req.body)
            await Customer.findOneAndUpdate({_id: req.params.customerId}, req.body, {new: true})
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
            let stockInCart = await Customer.findOne({_id: customerId}).populate('cart.productId')
            delete stockInCart._doc.cart[0]['productId']
            console.log(stockInCart)
            if(!stockInCart)
                throw {
                    status: 'Customer is not valid'
                }
            res.status(200).json(stockInCart.cart)
        }catch(error){
            res.status(404).send(error)
        }
    }
}
