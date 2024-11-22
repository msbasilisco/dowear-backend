module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      categoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      categoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
      },
    }, {
      sequelize,
      tableName: 'categories', 
      timestamps: true,        
      paranoid: true,        
    });
  
    return Category;
  };
  