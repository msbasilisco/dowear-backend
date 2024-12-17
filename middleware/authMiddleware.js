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
    console.log('Running Protect Middleware...');
    console.log('Headers:', req.headers);
    console.log('Token:', req.headers.authorization);

    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findOne({ where: { email: decoded.email } });
            if (!req.user) {
                return res.status(401).json({ message: 'User not found!' });
            }
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Token invalid or expired!' });
        }
    } else if (req.session?.user) {
        req.user = req.session.user;
        return next();
    }

    return res.status(401).json({ message: 'Not authenticated!' });
};

module.exports = { protect, ensureAuthenticated };