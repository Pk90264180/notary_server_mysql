const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// const connection = mysql.createConnection({
//   host: '127.0.0.1',
//   port: 3306,
//   user: 'root',
//   password: 'kali',
//   database: 'notary_server',
// });

const connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
  } else {
    console.log('Connected to MySQL server');
  }
});

module.exports = connection;
