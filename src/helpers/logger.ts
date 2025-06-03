import pino from 'pino';
import path from 'path';
import fs from 'fs';

const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'app.log');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export const logger = pino({
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    colorize: false,
                    translateTime: false,
                    ignore: 'pid,hostname,time,level',
                    messageFormat: '{msg}',
                    hideObject: true,
                },
            },
            {
                target: 'pino/file',
                options: { destination: logFile },
            },
        ],
    },
});
