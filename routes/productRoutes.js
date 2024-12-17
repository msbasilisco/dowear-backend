const express = require('express');
const router = express.Router();
const { createProduct,
    updateProduct,
    deleteProduct,
    getProductsByTag,
    getAllProductsByCategory,
    getRelatedItems,
    getAllProducts,
    getLatestProducts,
    getAllProductsByUser
    } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/products/addProduct', protect, upload.single('image'), createProduct);
router.get('/products/userProducts', protect, getAllProductsByUser);
router.get('/products/tags/:tagName', getProductsByTag);
router.get('/products/category/:catID', getAllProductsByCategory);
router.get('/products/allProducts', getAllProducts);
router.get('/products/latest-Products', getLatestProducts);
router.put('/products/:id', protect, upload.single('product_image'), updateProduct);
router.delete('/products/:id', protect, deleteProduct);

module.exports = router;