const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function createTable() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASS ?? '',
        database: process.env.DB_NAME ?? 'lms_db'
    });

    try {
        console.log('Creating login_history table...');

        await conn.execute(`
            CREATE TABLE IF NOT EXISTS login_history (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNSIGNED NOT NULL,
                login_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45) NOT NULL,
                CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Table login_history created successfully.');
    } catch (err) {
        console.error('❌ Failed to create table:', err);
    } finally {
        await conn.end();
    }
}

createTable();
