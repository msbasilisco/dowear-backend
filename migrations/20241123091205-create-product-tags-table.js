'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ProductTags', {
      productID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'products',
          key: 'productID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tagID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tags',
          key: 'tagID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addConstraint('ProductTags', {
      fields: ['productID', 'tagID'],
      type: 'primary key',
      name: 'product_tag_pkey'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductTags');
  }
};
