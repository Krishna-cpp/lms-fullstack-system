const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Assuming empty password as per .env default
            database: 'lms_db'
        });
        console.log('Successfully connected to database!');
        await connection.end();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

testConnection();
