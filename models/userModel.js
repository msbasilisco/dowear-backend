// models/user.js
const { hashPassword } = require('../utils/passwordUtils');  // Import the hashPassword function

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        userID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 100]  // Password length validation
            }
        },
        user_address: {
            type: DataTypes.ENUM,
            values: [
                'Angeles City', 'Antipolo', 'Bacolod', 'Bacoor', 'Baguio', 'Batangas', 'Bogo City', 'Butuan City',
                'Cabanatuan City', 'Cabuyao City', 'CDO City', 'Calamba City', 'Calapan City', 'Caloocan City',
                'Carcar City', 'Cebu City', 'Cotabato City', 'Danao City', 'Davao City', 'Dipolog City', 'Dumaguete City',
                'Gapan City', 'Guihulngan City', 'Iloilo City', 'Lapu-lapu City', 'Lipa City', 'Lucena City', 'Makati City',
                'Malabon City', 'Mandaue City', 'Malolos City', 'Naga City', 'Pasig City', 'Pasay City', 'Quezon City',
                'Roxas City', 'San Carlos City', 'Santiago City', 'Tagaytay City', 'Talisay City', 'Tarlac City', 'Valencia City',
                'Zamboanga City', 'Vigan City', 'Valenzuela City',
            ],
        },
        user_rating: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0, // Minimum rating
                max: 5  // Maximum rating
            }
        }
    }, {
        
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await hashPassword(user.password);  // Hash the password before saving
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await hashPassword(user.password);  // Hash the password if it's updated
                }
            }
        },
        sequelize,
        modelName: 'User',  // Model name
        tableName: 'users', // Table name
        timestamps: true,   // Enable createdAt and updatedAt columns
        paranoid: true      // Enable soft deletes (deletedAt column)
    });

    return User;
};
