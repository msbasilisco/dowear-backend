# dowear: a buy and sell app

## Overview
This repository contains the backend implementation of dowear. The backend is built using Node.js, Express.js, Sequelize, and MySQL. It provides APIs to support user authentication, product listings, shopping cart functionality, and checkout processes.

## Features
- User authentication and authorization.
- CRUD operations for managing products.
- Shopping cart management.
- Checkout and order processing.
- Recently viewed items.
- Related product recommendations.
- MySQL database integration via Sequelize ORM.

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
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=''
   DB_NAME=dowear_db
   JWT_SECRET='hellodowear'
   ```
5. Run database migrations and seed data:
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
6. Start the server:
   ```bash
   npm start
   ```
   The server will run at `http://localhost:3000`.

## Related Repository
This project is paired with the frontend implementation built with React. Find the frontend repository here: [dowear frontend](https://github.com/psalmantha/dowear-frontend.git)

## Contributing
Contributions are welcome! Please fork the repository and create a pull request for any features, fixes, or enhancements.

## This is project is created by
- Basilisco, Farah Jane  
- Bonachita, Clybel Djen  
- Ipong, Psalmantha Allain
