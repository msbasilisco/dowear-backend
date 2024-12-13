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
      allowNull: true,
      references: {
        model: 'users',
        key: 'userID',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'categoryID',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, 
      allowNull: true,
    },
    product_image_public_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    modelName: 'Product',
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

    Product.hasMany(models.Variation, {
      foreignKey: 'productID',
      as: 'variations',
    });

    Product.belongsToMany(models.Tag, {
      through: models.ProductTag,
      foreignKey: 'productID',
      otherKey: 'tagID',
      as: 'tags'
    });
  };

  return Product;
};
