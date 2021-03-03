const express = require('express')
const router = express.Router()

const productRoute = require('./api/products.route')
const customerRoute = require('./api/customer.route')

router.use('/product', productRoute);
router.use('/customer', customerRoute)
module.exports=router