'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Category.init({
    name: DataTypes.STRING, // AÑADIDO: coma, porque ahora hay un campo más detrás
    icon: DataTypes.STRING // AÑADIDO: icono (emoji) de la categoría, para el EXTRA 4 (icono en las categorías)
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};