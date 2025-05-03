require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d'
};