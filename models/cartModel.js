module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define('Cart', {
      cartID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'userID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'productID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      variationID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'variations',
          key: 'variationID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'checkout', 'abandoned'),
        defaultValue: 'active',
        allowNull: false,
        comment: 'active: in cart, checkout: selected for purchase'
      }
    }, {
      modelName: 'Cart',
      tableName: 'cart',
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeSave: (cart) => {
          // Automatically calculate subtotal
          cart.subtotal = cart.unit_price * cart.quantity;
        }
      }
    });
  
    Cart.associate = (models) => {
      Cart.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'user'
      });
  
      Cart.belongsTo(models.Product, {
        foreignKey: 'productID',
        as: 'product'
      });
  
      Cart.belongsTo(models.Variation, {
        foreignKey: 'variationID',
        as: 'variation'
      });
    };
  
    return Cart;
  };