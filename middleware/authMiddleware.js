const jwt = require('jsonwebtoken');
const { User } = require('../models');
const session = require('express-session');

const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ message: "Unauthorized. Please log in." });
};

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findOne({ where: { email: decoded.email } });

            if (!req.user) {
                return res.status(401).json({ message: 'User not found!' });
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed!' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token!' });
    }
};

module.exports = { protect, ensureAuthenticated };