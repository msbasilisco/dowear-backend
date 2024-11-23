module.exports = (sequelize, DataTypes) => {
    const ProductTag = sequelize.define('ProductTag', {
        productID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'productID'
            }
        },
        tagID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tags',
                key: 'tagID'
            }
        }
    }, {
        modelName: 'ProductTag',
        tableName: 'ProductTags',
        timestamps: true,
        paranoid: false,
    });

    return ProductTag;
};
