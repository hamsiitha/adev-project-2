const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'adev',
  database: 'vending_machine'
});

connection.connect(err => {
  if (err) {
    console.error('Connection error: ', err); // Log more detailed error
    return;
  }
  console.log('Connected to DB');
});

module.exports = connection;
