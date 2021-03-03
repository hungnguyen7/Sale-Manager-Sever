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
        type: {type: Number},
        amount: Number,
        buyInto: Boolean
    }]
})

let Customer = mongoose.model('Customer', CustomerSchema, 'customers')
module.exports = Customer