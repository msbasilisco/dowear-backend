'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns for product image
    await queryInterface.addColumn('products', 'product_image_public_id', {
      type: Sequelize.STRING,
      allowNull: false, // Set to false since it's required
    });

    await queryInterface.addColumn('products', 'product_image_url', {
      type: Sequelize.STRING,
      allowNull: false, // Set to false since it's required
    });

    // Optionally, if you want to remove the old product_image column
    await queryInterface.removeColumn('products', 'product_image');
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes made in the up method
    await queryInterface.removeColumn('products', 'product_image_public_id');
    await queryInterface.removeColumn('products', 'product_image_url');

    // Optionally, if you want to add back the old product_image column
    await queryInterface.addColumn('products', 'product_image', {
      type: Sequelize.STRING,
      allowNull: true, // Adjust as needed
    });
  }
};