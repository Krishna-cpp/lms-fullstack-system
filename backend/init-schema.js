const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initSchema() {
    try {
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Remove comments and split by semicolon
        // This is a naive split, but schema.sql seems simple enough
        // We need to handle DELIMITER if present, but standard schema usually doesn't have complex ones
        // actually mysql2 multipleStatements: true handles this better.

        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            multipleStatements: true
        });

        console.log('Connected to MySQL. Executing schema...');

        // We might need to create DB first if it doesn't exist, which schema.sql does:
        // "CREATE DATABASE IF NOT EXISTS lms_db ..."
        // "USE lms_db;"

        await connection.query(schemaSql);

        console.log('Schema executed successfully.');
        await connection.end();
    } catch (err) {
        console.error('Schema initialization failed:', err);
    }
}

initSchema();
