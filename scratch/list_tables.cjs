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

    console.log('Tables:');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(tables);

    if (tables.length > 0) {
      const tableName = Object.values(tables[0])[0];
      const [cols] = await connection.execute(`DESCRIBE ${tableName}`);
      console.log(`Schema for ${tableName}:`, cols);
      
      const [cols2] = await connection.execute(`DESCRIBE global_settings`);
      console.log(`Schema for global_settings:`, cols2);
      
      const [cols3] = await connection.execute(`DESCRIBE pages`);
      console.log(`Schema for pages:`, cols3);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDB();
