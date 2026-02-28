import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export async function initDB() {
    const dbConfig = {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? '',
    };

    const dbName = process.env.DB_NAME ?? 'lms_db';

    // 1. Connect without DB to check/create it
    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log(`🔌 Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database '${dbName}' check/creation successful.`);

        await connection.changeUser({ database: dbName });

        // 2. Read and execute schema
        const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('📄 Executing schema.sql...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            // Allow multiple statements for schema execution
            const schemaConnection = await mysql.createConnection({
                ...dbConfig,
                database: dbName,
                multipleStatements: true
            });

            try {
                await schemaConnection.query(schemaSql);
                console.log('✅ Schema initialized successfully.');
            } finally {
                await schemaConnection.end();
            }
        } else {
            console.warn(`⚠️ Schema file not found at ${schemaPath}`);
        }

        // 3. Verify tables
        const [rows] = await connection.query('SHOW TABLES');
        const tables = (rows as any[]).map(row => Object.values(row)[0]);
        console.log('📊 Verified Tables:', tables.join(', '));

    } catch (err: any) {
        console.error('❌ Database Initialization Failed:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}
