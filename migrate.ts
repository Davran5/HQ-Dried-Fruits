import Database from 'better-sqlite3';
const db = new Database('hq_dried_fruits.db');

function migrateTable(tableName, columns) {
    try {
        const info = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const existingColumns = info.map(c => c.name);
        console.log(`Checking ${tableName}...`);
        for (const column of columns) {
            if (!existingColumns.includes(column)) {
                console.log(`  Adding ${column} to ${tableName}`);
                db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${column} TEXT`).run();
            } else {
                console.log(`  ${column} already exists`);
            }
        }
    } catch (e) {
        console.error(`Error migrating ${tableName}: ${e.message}`);
    }
}

migrateTable('products_page', ['ordering_bg_image', 'ordering_form_title', 'ordering_form_subtitle', 'quick_phone', 'quick_email']);
migrateTable('export_page', ['packaging_methods', 'transportation_methods']);
migrateTable('contacts_page', ['headquarters_image']);

db.close();
console.log("Migration complete.");
