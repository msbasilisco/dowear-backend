module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        orderItemID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        orderID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'orderID'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        productID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'productID'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        variationID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'variations',
                key: 'variationID'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'order_items',
        timestamps: true,
        paranoid: true
    });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, {
            foreignKey: 'orderID',
            as: 'order'
        });

        OrderItem.belongsTo(models.Product, {
            foreignKey: 'productID',
            as: 'product'
        });

        OrderItem.belongsTo(models.Variation, {
            foreignKey: 'variationID',
            as: 'variation'
        });
    };

    return OrderItem;
};