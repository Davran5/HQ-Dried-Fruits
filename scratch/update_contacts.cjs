require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateContacts() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'hqdriedfruits',
      password: process.env.DB_PASS || '12345678',
      database: process.env.DB_NAME || 'hqdriedfruits_db',
    });

    console.log('Connected to MySQL.');

    // Update global_settings
    console.log('Updating global_settings...');
    const [settingsRows] = await connection.execute('SELECT `key`, `value` FROM global_settings');
    
    for (const row of settingsRows) {
      if (row.key === 'phoneNumber' || row.key === 'quickPhone') {
        await connection.execute('UPDATE global_settings SET `value` = ? WHERE `key` = ?', ['+998 99 892 99 77', row.key]);
      }
      if (row.key === 'emailAddress' || row.key === 'quickEmail' || row.key === 'formDestinationEmail') {
        await connection.execute('UPDATE global_settings SET `value` = ? WHERE `key` = ?', ['sales@hqdriedfruits.uz', row.key]);
      }
      if (row.key === 'officeAddress') {
        await connection.execute('UPDATE global_settings SET `value` = ? WHERE `key` = ?', ['14A, 10th Block, Chilanzar dist., Tashkent, Uzbekistan', row.key]);
      }
    }
    
    // Update Contacts page content
    console.log('Updating pages table...');
    const [pageRows] = await connection.execute('SELECT `id`, `content` FROM pages WHERE `id` = ?', ['contacts']);
    if (pageRows.length > 0) {
      const contentStr = pageRows[0].content;
      if (contentStr) {
        let contentObj = JSON.parse(contentStr);
        contentObj.emailAddress = 'sales@hqdriedfruits.uz';
        contentObj.phoneNumber = '+998 99 892 99 77';
        contentObj.officeAddress = '14A, 10th Block, Chilanzar dist., Tashkent, Uzbekistan';
        
        await connection.execute('UPDATE pages SET `content` = ? WHERE `id` = ?', [JSON.stringify(contentObj), 'contacts']);
      }
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

updateContacts();
