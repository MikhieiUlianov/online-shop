const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  database: process.env.SQL_DATABASE,
  password: process.env.SQL_PASSWORD,
});
module.exports = pool.promise();
/* const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "node-complete",
  password: "kavcen5&anAuf",
}); */
