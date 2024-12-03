const orderController = require('../controllers/orderController')
const { authenticateToken } = require('../controllers/userController')
const router = require('express').Router()

// Create and manage orders
router.post('/create', authenticateToken, orderController.createOrder)
router.put('/:orderID/shipping', authenticateToken, orderController.updateShippingDetails)
router.put('/:orderID/status', authenticateToken, orderController.updateOrderStatus)
router.put('/:orderID/cancel', authenticateToken, orderController.cancelOrder)

// Get order information
router.get('/all', authenticateToken, orderController.getOrders)
router.get('/history', authenticateToken, orderController.getOrdersByStatus)
router.get('/:orderID', authenticateToken, orderController.getOrderDetails)

module.exports = router