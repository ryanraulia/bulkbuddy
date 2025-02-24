const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const userEmail = 'admin@example.com'; // Replace with the user's email
const newPasswordHash = '$2b$10$TBzzXdxP.kiAn35KQqxrjOzuwAwAh7KQYfPC5eNKhnBMf.vL9AGCW'; // Replace with the generated hash

connection.query(
  'UPDATE users SET password = ? WHERE email = ?',
  [newPasswordHash, userEmail],
  (error, results) => {
    if (error) {
      console.error('Error updating password:', error);
    } else {
      console.log('Password updated successfully for user:', userEmail);
    }
    connection.end();
  }
);