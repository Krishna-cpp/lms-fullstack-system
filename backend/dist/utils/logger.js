"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLogin = logLogin;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const LOG_DIR = path_1.default.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path_1.default.join(LOG_DIR, 'login_activity.log');
// Ensure logs directory exists
if (!fs_1.default.existsSync(LOG_DIR)) {
    fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
}
function logLogin(email, success, ip = 'unknown') {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILURE';
    const message = `[${timestamp}] Login attempt: ${email} - ${status} - IP: ${ip}\n`;
    fs_1.default.appendFile(LOG_FILE, message, (err) => {
        if (err)
            console.error('Failed to write login log:', err);
    });
}
//# sourceMappingURL=logger.js.map