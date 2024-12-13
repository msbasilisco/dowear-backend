const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Use environment variable
    api_key: process.env.CLOUDINARY_API_KEY,       // Use environment variable
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Set up multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'productsImage', // Optional: specify a folder in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed formats
    },
});

// Export the configured Cloudinary and storage
module.exports = {
    cloudinary,
    storage
};
