const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Variation = sequelize.define('Variation', {
    variationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    variation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    productID:{
        type:DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'products',
            key: 'productID',
        }
    }
  }, {
    sequelize,
    modelName: 'Variation',
    tableName: 'variations',
    timestamps: true,
    paranoid: true,
  });

  
  Variation.associate = (models) => {
    Variation.belongsTo(models.Product, {
      foreignKey: 'productID',  
      as: 'product',
    });
  };

  return Variation;
};
