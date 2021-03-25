const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/customer.controller')

router.get('/all', controller.getCustomers)
router.get('/seller', controller.getSeller)
router.get('/buyer', controller.getBuyer)
router.get('/:customerId', controller.getCustomerById)
router.get('/:customerId/cart', controller.getCart)



router.post('/create', controller.createCustomer)

router.delete('/:customerId', controller.deleteOneUser)
router.delete('/cart/:dealId', controller.deleteDealById)

router.patch('/:customerId/edit', controller.editCustomer)
router.put('/:customerId/addToCart', controller.addToCart)
module.exports = router