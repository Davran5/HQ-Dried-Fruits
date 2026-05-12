require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'hqdriedfruits',
      password: process.env.DB_PASS || '12345678',
      database: process.env.DB_NAME || 'hqdriedfruits_db',
    });

    console.log('Connected to MySQL.');

    // Update contacts_page
    console.log('Updating contacts_page...');
    await connection.execute(`
      UPDATE contacts_page 
      SET phone = '+998 99 892 99 77',
          email = 'sales@hqdriedfruits.uz',
          office_address = '14A, 10th Block, Chilanzar dist., Tashkent, Uzbekistan',
          form_destination_email = 'sales@hqdriedfruits.uz'
    `);
    
    // Check products_page schema
    const [cols] = await connection.execute('DESCRIBE products_page');
    const colNames = cols.map(c => c.Field);
    
    // Update products_page if columns exist
    console.log('Updating products_page...');
    if (colNames.includes('quick_phone')) {
      await connection.execute(`UPDATE products_page SET quick_phone = '+998 99 892 99 77'`);
    }
    if (colNames.includes('quick_email')) {
      await connection.execute(`UPDATE products_page SET quick_email = 'sales@hqdriedfruits.uz'`);
    }
    
    console.log('Successfully updated contact information in database.');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateDB();
