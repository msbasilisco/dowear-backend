'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the categories table
    await queryInterface.createTable('categories', {
      categoryID: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      categoryName: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true, // Ensures unique category names
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
        type: Sequelize.DATE, // Soft delete support
      },
    });

    // Bulk insert predefined categories with fixed IDs
    await queryInterface.bulkInsert('categories', [
      { categoryID: 1, categoryName: 'Womens Fashion', createdAt: new Date(), updatedAt: new Date() },
      { categoryID: 2, categoryName: 'Mens Fashion', createdAt: new Date(), updatedAt: new Date() },
      { categoryID: 3, categoryName: 'Gadgets and Electronics', createdAt: new Date(), updatedAt: new Date() },
      { categoryID: 4, categoryName: 'Jewelry & Accessories', createdAt: new Date(), updatedAt: new Date() },
      { categoryID: 5, categoryName: 'Beauty & Personal Care', createdAt: new Date(), updatedAt: new Date() },
      { categoryID: 6, categoryName: 'Home and Furniture', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove the categories table
    await queryInterface.dropTable('categories');
  },
};
