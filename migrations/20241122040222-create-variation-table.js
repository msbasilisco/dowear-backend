'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('variations', {
       variationID:{
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
       },
       variation:{
        type: Sequelize.STRING,
        allowNull: false,
       },
       price:{
        type: Sequelize.FLOAT,
        allowNull: false,
       },
       quantity:{
        type: Sequelize.INETEGER,
        allowNull: false,
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

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable('variations');
    
  }
};
