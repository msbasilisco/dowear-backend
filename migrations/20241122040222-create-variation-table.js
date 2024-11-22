'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('variations', {
      variationID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, 
      },
      variation: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0, 
        },
      },
      quantity: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {
          min: 0, 
        },
      }, 
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',  
          key: 'productID',   
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('variations');
  },
};
