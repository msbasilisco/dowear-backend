# dowear: a buy and sell app

## Overview
This repository contains the backend implementation of dowear. The backend is built using Node.js, Express.js, Sequelize, and MySQL. It provides APIs to support user authentication, product listings, shopping cart functionality, and checkout processes.

## Features
- User Authentication & Authorization (JWT, Role-based access)
- CRUD Operations for Products (Create, Read, Update, Delete)
- Image Upload & Display (Using Multer and Cloudinary for image storage and URLs)
- Shopping Cart Management (Store items in DB)
- Product Recommendations (Related products based on category/tag)
- Recently Viewed Tracking (Track and recommend based on recent activity)
- Seller Ratings & Reviews (Store and retrieve ratings/reviews)
- Order Processing (Order creation, no payment integration yet)
- MySQL Database Integration (via Sequelize ORM)
- Seller Product Listings (Get products by seller)

## Technologies Used
- **Node.js**
- **Express.js**
- **Sequelize**
-  **Cloudinary**
- **MySQL**
- **JWT Authentication**

## Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js [Download here](https://nodejs.org/en/download/prebuilt-installer)
- MySQL [Download here](https://www.oracle.com/mysql/technologies/mysql-enterprise-edition-downloads.html)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/msbasilisco/dowear-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd dowear-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure the `.env` file with your database credentials and other necessary environment variables:
   ```env
   JWT_SECRET = hellodowear
   JWT_REFRESH_SECRET = hellodowear
   SESSION_SECRET = hellodowear
   DB_HOST = localhost
   DB_USER = root
   DB_PASSWORD = ''
   DB_NAME = dowear_db
   DB_DIALECT = mysql
   API_KEY = hellodowear
   
   DB_POOL_MAX = 5
   DB_POOL_MIN = 0
   DB_POOL_ACQUIRE = 30000
   DB_POOL_IDLE = 10000
   
   CLOUDINARY_CLOUD_NAME= duhd59w65
   CLOUDINARY_API_KEY= 214348456511783
   CLOUDINARY_API_SECRET= p6ZWkM2G74XQMdjbeOaaamqSBxM
   ```
5. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```
6. Start the server:
   ```bash
   nodemon app.js
   ```
   The server will run at `http://localhost:3000`.

## Related Repository
This project is paired with the frontend implementation built with Vite + React. Find the frontend repository here: [dowear frontend](https://github.com/psalmantha/dowear-frontend.git)

## Contributing
Contributions are welcome! Please fork the repository and create a pull request for any features, fixes, or enhancements.

## This is project is created by
- Basilisco, Farah Jane  
- Bonachita, Clybel Djen  
- Ipong, Psalmantha Allaine
