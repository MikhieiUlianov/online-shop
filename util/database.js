/* const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  database: process.env.SQL_DATABASE,
  password: process.env.SQL_PASSWORD,
});
module.exports = pool.promise();
 */

const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.SQL_DATABASE,
  process.env.SQL_USER,
  process.env.SQL_PASSWORD,
  { dialect: "mysql", host: process.env.SQL_HOST }
);
module.exports = sequelize;
