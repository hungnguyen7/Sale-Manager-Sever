const Customer = require('./customer.model') 
const mongoose = require('mongoose')
let productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    classification:[{
        type: {
            type: Number,
            required: true,
            min: 1,
            max: 3,
            default: 1
        },
        amount: {
            type: Number,
            required: true,
            min:0, 
            default: 0
        },
        purchasePrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        salePrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    }],
    created:{
        type: Date,
        default: Date.now
    }
})
productSchema.post('findOneAndDelete', async function(doc){
    await Customer.updateMany({
        "cart.productId": doc._id
    }, {
        $pull:{
            cart: {
                productId: doc._id
            }
        }
    })
    console.log(doc._id)
})
let Product = mongoose.model('Product', productSchema, 'products')
module.exports = Product