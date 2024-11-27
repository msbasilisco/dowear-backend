const productController = require ('../controllers/productController')
const router = require('express').Router()
const {protect } = require('../middleware/authMiddleware')

router.post('/addProduct',protect, productController.createProduct)
router.put('/products/:id',productController.updateProduct)
router.delete('/products/:id', productController.deleteProduct)

module.exports = router;