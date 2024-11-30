const dbConfig = require('../config/dbConfig.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD, {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorsAliases: 0,

        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        }
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Connected to database...');
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
    });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./userModel.js')(sequelize, DataTypes);
db.Product = require('./productModel.js')(sequelize, DataTypes);
db.Category = require('./categoriesModel.js')(sequelize, DataTypes);
db.Tag = require('./tagsModel.js')(sequelize, DataTypes);
db.Variation = require('./variationModel.js')(sequelize, DataTypes);
db.ProductTag = require('./productTagModel.js')(sequelize, DataTypes);
db.Cart = require('./cartModel.js')(sequelize, DataTypes);

// Initialize associations
Object.values(db)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(db));

// Sync database
db.sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synchronized successfully');
    })
    .catch(err => {
        console.error('Error synchronizing database:', err);
    });

module.exports = db;