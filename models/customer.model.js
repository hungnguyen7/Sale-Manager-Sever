const mongoose = require('mongoose')
// const Product = require('./product.model')
let CustomerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    phone: Number,
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        type: {
            type: Number,
            min: 1, 
            max: 3
        },
        amount: {
            type: Number,
            min: 0
        },
        buyInto: Boolean
    }]
})
let Customer = mongoose.model('Customer', CustomerSchema, 'customers')
module.exports = Customer