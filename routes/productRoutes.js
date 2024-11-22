const productController = require ('../controllers/productController')
const router = require('express').Router()
const {protect } = require('../middleware/authMiddleware')

router.post('/addProduct',protect, productController.createProduct)

module.exports = router;