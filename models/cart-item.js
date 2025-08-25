const Sequelize = require("sequelize");

const sequalize = require("../util/database");

const CartItem = sequalize.define("cartItem", {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
  },
  quantity: Sequelize.NUMBER,
});

module.exports = CartItem;
