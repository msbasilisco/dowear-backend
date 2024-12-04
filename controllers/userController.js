const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/dbConfig');
const db = require('../models');
const { protect } = require('../middleware/authMiddleware');
const User = db.User;

// For creating users
const register = async (req, res) => {
    const { email, username, password, user_address, user_rating } = req.body;

    try {
        const existingUser = await User.findOne({ where: { username } });
        const existingEmail = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'This username already exists!' });
        }

        if (existingEmail) {
            return res.status(400).json({ message: 'This email already exists!' });
        }


        const newUser = await User.create({
            email: email,
            username: username,
            password: password,
            city_address: user_address,
            user_rating: user_rating || null,
        });

        return res.status(201).json({ message: 'Account successfully created!', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Error registering user.' });
    }
};

// Login
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
       
        const user = await User.findOne({ where: { username } });
        console.log('Fetched User: ',user)

        if (!user) {
            return res.status(400).json({ message: 'Sorry, user not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { userID: user.userID, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login Successful!',
            token,
            user: { id: user.id, email: user.email, username: user.username },
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'An error occurred during login.' });
    }
};

// Fetch cities
const getCities = (req, res) => {
    const cities = [
      'Angeles City', 'Antipolo', 'Bacolod', 'Bacoor', 'Baguio', 'Batangas', 
      'Bogo City', 'Butuan City', 'Cabanatuan City', 'Cabuyao City', 'CDO City', 
      'Calamba City', 'Calapan City', 'Caloocan City', 'Carcar City', 'Cebu City', 
      'Cotabato City', 'Danao City', 'Davao City', 'Dipolog City', 'Dumaguete City',
      'Gapan City', 'Guihulngan City', 'Iloilo City', 'Lapu-lapu City', 'Lipa City',
      'Lucena City', 'Makati City', 'Malabon City', 'Mandaue City', 'Malolos City', 
      'Naga City', 'Pasig City', 'Pasay City', 'Quezon City', 'Roxas City', 'San Carlos City',
      'Santiago City', 'Tagaytay City', 'Talisay City', 'Tarlac City', 'Valencia City', 
      'Zamboanga City', 'Vigan City', 'Valenzuela City'
    ];
    if(cities.length > 0){
      return res.json(cities);
    }else{
      return res.json({ message: 'No cities found' });
    }
  };
  


// Get user profile (Authenticated route)
const getUserProfile = async (req, res) => {
    try {
        const { email } = req.user; // Extract email from authenticated token

        // Fetch user details
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Return user profile details
        return res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            user_address: user.city_address,
            user_rating: user.user_rating,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Error fetching user profile.' });
    }
};

// Display all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'username', 'city_address', 'user_rating'], // Limit returned fields
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Error fetching users.' });
    }
};


module.exports = {
    register,
    login,
    getUserProfile,
    getAllUsers,
    getCities
};