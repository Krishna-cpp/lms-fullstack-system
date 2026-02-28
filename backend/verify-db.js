const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function verifyDB() {
    console.log('🔍 Verifying Database Configuration...');

    const dbConfig = {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASS ?? '',
        database: process.env.DB_NAME ?? 'lms_db'
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log(`✅ Connected to MySQL database: ${dbConfig.database}`);

        const [rows] = await connection.query('SHOW TABLES');
        const tables = rows.map(row => Object.values(row)[0]);

        console.log(`📊 Found ${tables.length} tables:`);

        for (const table of tables) {
            const [countRows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            const count = countRows[0].count;
            console.log(`   - ${table}: ${count} rows`);
        }

        console.log('\n✅ Database verification complete. System is ready.');
        await connection.end();
    } catch (err) {
        console.error('❌ Database verification failed:', err.message);
        process.exit(1);
    }
}

verifyDB();
