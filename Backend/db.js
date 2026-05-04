const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'mariadb',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || 'secret',
  database: process.env.DB_NAME     || 'appdb',
  waitForConnections: true
})

module.exports = pool