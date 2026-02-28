const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');

async function checkLoginHistory() {
    console.log('1. Sending Login Request...');
    const data = JSON.stringify({ email: 'eleanor@lms.dev', password: 'instructor123' });
    const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
        console.log(`Login Response Status: ${res.statusCode}`);
        res.on('data', (d) => { process.stdout.write(d) });
        res.on('end', async () => {
            console.log('\nLogin request completed. Waiting 2s for DB insert...');
            setTimeout(async () => {
                console.log('2. Checking database...');
                const conn = await mysql.createConnection({
                    host: process.env.DB_HOST ?? 'localhost',
                    port: Number(process.env.DB_PORT ?? 3306),
                    user: process.env.DB_USER ?? 'root',
                    password: process.env.DB_PASS ?? '',
                    database: process.env.DB_NAME ?? 'lms_db'
                });
                try {
                    const [rows] = await conn.execute(
                        'SELECT lh.*, u.email FROM login_history lh JOIN users u ON lh.user_id = u.id ORDER BY lh.id DESC LIMIT 1'
                    );
                    if (rows.length > 0) {
                        console.log('✅ Latest Login Record Found:', rows[0]);
                    } else {
                        console.log('❌ No login records found.');
                    }
                } catch (err) {
                    console.error('DB Check Failed:', err);
                } finally {
                    await conn.end();
                }
            }, 2000);
        });
    });
    req.on('error', (e) => console.error(`Problem with request: ${e.message}`));
    req.write(data);
    req.end();
}

// Wait for server to be ready
setTimeout(checkLoginHistory, 3000);
