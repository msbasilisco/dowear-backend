const express = require('express');
const {
    register,
    login,
    logout,
    getUserProfile,
    getAllUsers,
    getCities,
    getSession,
} = require('../controllers/userController');
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/getUserProfile', protect, getUserProfile);
router.get('/allUsers', protect, getAllUsers);
router.get('/cities', getCities);
router.get('/session', getSession);

module.exports = router;
