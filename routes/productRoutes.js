const productController = require ('../controllers/productController')
const router = require('express').Router()
const {protect } = require('../middleware/authMiddleware')

router.post('/addProduct',protect, productController.createProduct)
router.get('/products/tags/:tagName',productController.getProductsByTag)
router.get('/products/category/:catID', productController.getAllProductsByCategory)
router.get('/products/allProducts',productController.getAllProducts)
router.put('/products/:id',productController.updateProduct)
router.delete('/products/:id', productController.deleteProduct)


module.exports = router;