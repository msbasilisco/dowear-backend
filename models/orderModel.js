module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    orderID: {
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
      onDelete: 'RESTRICT',
    },
    recipient_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^(\+0)[0-9]{10}$/  // Philippine phone number format
      }
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    total_amount: { //add all subtotal from order_items
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('cod', 'gcash', 'maya'),
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
  }, {
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    paranoid: true,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user'
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderID',
      as: 'items'
    });
  };

  return Order;
};

