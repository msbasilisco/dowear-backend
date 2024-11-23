const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
        tagID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        }
    }, {
        modelName: 'Tag',
        tableName: 'tags',
        timestamps: true,
        paranoid: true,
    });

    Tag.associate = (models) => {
        Tag.belongsToMany(models.Product, {
            through: 'ProductTags',
            foreignKey: 'tagID',
            otherKey: 'productID',
            as: 'products'
        });
    };

    return Tag;
};