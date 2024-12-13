const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage or disk storage
const upload = multer({ storage: storage });

router.post('/products/addProduct', protect, upload.single('product_image'), productController.createProduct);
router.get('/products/tags/:tagName', productController.getProductsByTag);
router.get('/products/category/:catID', productController.getAllProductsByCategory);
router.get('/products/allProducts', productController.getAllProducts);
router.get('/products/latest-Products', productController.getLatestProducts);
router.put('/products/:id', protect, upload.single('product_image'), productController.updateProduct);
router.delete('/products/:id', protect, productController.deleteProduct);

module.exports = router;