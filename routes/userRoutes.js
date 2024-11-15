const userController = require('../controllers/userController')
const router = require('express').Router()

router.post('/register',userController.register)
router.post('/login',userController.login)
router.get('/getUserProfile', userController.authenticateToken, userController.getUserProfile);
router.get('/allUsers', userController.authenticateToken, userController.getAllUsers);

module.exports = router

