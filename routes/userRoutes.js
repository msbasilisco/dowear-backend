const userController = require('../controllers/userController')
const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware');

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/getUserProfile', protect, userController.getUserProfile);
router.get('/allUsers', protect, userController.getAllUsers);
router.get('/cities', userController.getCities);

module.exports = router

