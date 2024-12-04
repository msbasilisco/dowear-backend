const orderController = require('../controllers/orderController')
// const { authenticateToken } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware');
const router = require('express').Router()

// Create and manage orders
router.post('/create', protect, orderController.createOrder)
router.put('/:orderID/status', protect, orderController.updateOrderStatus)
router.put('/:orderID/shipping', protect, orderController.updateShippingDetails)
router.put('/:orderID/cancel', protect, orderController.cancelOrder)

// Get order information
router.get('/all', protect, orderController.getOrders)
router.get('/history', protect, orderController.getOrdersByStatus)
router.get('/:orderID', protect, orderController.getOrderDetails)

module.exports = router