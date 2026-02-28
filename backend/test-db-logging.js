const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');

async function checkLoginHistory() {
    // 1. Trigger a login
    const data = JSON.stringify({ email: 'eleanor@lms.dev', password: 'instructor123' });
    const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
        res.on('data', () => { });
        res.on('end', async () => {
            console.log('Login request completed. Waiting for DB insert...');
            setTimeout(async () => {
                console.log('Checking database...');
                const conn = await mysql.createConnection({
                    host: process.env.DB_HOST ?? 'localhost',
                    port: Number(process.env.DB_PORT ?? 3306),
                    user: process.env.DB_USER ?? 'root',
                    password: process.env.DB_PASS ?? '',
                    database: process.env.DB_NAME ?? 'lms_db'
                });
                try {
                    const [rows] = await conn.execute('SELECT * FROM login_history ORDER BY id DESC LIMIT 1');
                    console.log('Latest Login Record:', rows[0]);
                } catch (err) {
                    console.error('DB Check Failed:', err);
                } finally {
                    await conn.end();
                }
            }, 1000);
        });
    });
    req.write(data);
    req.end();
}

// Give server time to start
setTimeout(checkLoginHistory, 3000);
