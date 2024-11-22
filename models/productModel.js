module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'userID',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories', 
        key: 'categoryID',
      },
    },
    prodVariation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'variations',
        key: 'variationID',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, 
      allowNull: true,
    },
    prod_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keyTags: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'products',
    timestamps: true,       
    paranoid: true,          
  });

 
  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: 'seller_id',
      as: 'seller',
    });

    Product.belongsTo(models.Category, {
      foreignKey: 'categoryID',
      as: 'category',
    });

    Product.belongsTo(models.Variation, {
      foreignKey: 'prodVariation',
      as: 'variation',
    });
  };

  return Product;
};
