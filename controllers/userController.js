const bcrypt = require('bcryptjs');  // To hash and compare passwords
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/dbConfig'); 
const db = require('../models');
const User = db.users;

//for creating users
const register = async (req, res) => {
    const { email, username, password, city_address, user_rating } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        return res.status(400).send({ message: 'This username already exists!' });
    }

    const info = {
        email: email,
        username: username,
        password: password,
        city_address: city_address,
        user_rating: user_rating
    };

    try {
        const reg = await User.create(info);
        return res.status(200).send('Account successfully created!');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error registering user.');
    }
};

//Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).send({ message: 'Sorry, user not found' });
        }

        console.log(user);
        console.log('Provided password:', password);
        console.log('Stored hashed password:', user.password);

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch);

        if (!isMatch) {
            return res.status(400).send({ message: 'Incorrect password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userID: user.userID, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login Successful!',
            token: token
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send({ message: 'An error occurred during login.' });
    }
};




const getUserProfile = async (req, res) => {
    const { email } = req.user;  // Extract email from JWT token

    
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(400).send({ message: 'User not found!' });
    }

    res.status(200).send({
        id: user.id,
        email: user.email,
        username: user.username,
        city_address: user.city_address,
        user_rating: user.user_rating
    });
};

// Display all users
const getAllUsers = async (req, res) => {
    try {
        let users = await User.findAll();
        res.status(200).send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users.');
    }
};

// Middleware to verify JWT token (Authentication)
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Token is expected in "Authorization: Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;  // Attach user info to the request
        next();
    });
};

module.exports = {
    register,
    login,
    getUserProfile,
    getAllUsers,
    authenticateToken  // Export the authentication middleware
};
