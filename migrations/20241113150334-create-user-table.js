'use strict';

const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      userID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      user_address: {
        type: Sequelize.ENUM,
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
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, 
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, 
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE, 
      },
    }, {
      paranoid: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
