'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', { 
      productID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      seller_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'users', 
          key: 'userID', 
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      categoryID: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'categories', 
          key: 'categoryID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT, 
      },
      product_image: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'), 
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'), 
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE, 
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
