const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/product.controller');

router.get('/all', controller.getProducts)
router.get('/:productId', controller.getProductById)

router.post('/create', controller.createProduct)

router.delete('/:productId', controller.deleteOneProduct)
router.delete('/:productId/:type', controller.deleteOneTypeOfProduct)

router.patch('/:productId/edit', controller.editProduct)
module.exports=router