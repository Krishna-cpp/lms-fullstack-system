import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'login_activity.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function logLogin(email: string, success: boolean, ip: string = 'unknown'): void {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILURE';
    const message = `[${timestamp}] Login attempt: ${email} - ${status} - IP: ${ip}\n`;

    fs.appendFile(LOG_FILE, message, (err) => {
        if (err) console.error('Failed to write login log:', err);
    });
}
