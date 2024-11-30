const cartController = require('../controllers/cartController');
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');

// All cart routes should be protected (require authentication)
router.use(protect);

router.post('/add', cartController.addToCart);
router.put('/update-quantity', cartController.updateQuantity);
router.delete('/:cartID', cartController.removeFromCart);
router.get('/', cartController.getCart);

router.put('/toggle/:cartID', cartController.toggleSelection);

module.exports = router;
