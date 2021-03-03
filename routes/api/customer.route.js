const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/customer.controller')

router.get('/all', controller.getCustomers)
router.get('/:customerId', controller.getCustomerById)
router.get('/:customerId/cart', controller.getCart)

router.post('/create', controller.createCustomer)

router.delete('/:customerId', controller.deleteOneUser)

router.patch('/:customerId/edit', controller.editCustomer)

module.exports = router