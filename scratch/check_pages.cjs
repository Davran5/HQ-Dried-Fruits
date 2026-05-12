require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'hqdriedfruits',
      password: process.env.DB_PASS || '12345678',
      database: process.env.DB_NAME || 'hqdriedfruits_db',
    });

    const [cols] = await connection.execute(`DESCRIBE contacts_page`);
    console.log(`Schema for contacts_page:`, cols);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDB();
