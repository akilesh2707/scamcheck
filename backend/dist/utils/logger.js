"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env_1 = require("../config/env");
class Logger {
    formatEntry(level, message, meta) {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            meta,
        };
    }
    output(entry) {
        const logLine = JSON.stringify(entry);
        if (env_1.config.nodeEnv === 'production') {
            console.log(logLine);
        }
        else {
            const colors = {
                debug: '\x1b[36m',
                info: '\x1b[32m',
                warn: '\x1b[33m',
                error: '\x1b[31m',
                reset: '\x1b[0m',
            };
            const color = colors[entry.level] || colors.reset;
            console.log(`${color}[${entry.level.toUpperCase()}]${colors.reset} ${entry.message}`, entry.meta || '');
        }
    }
    debug(message, meta) {
        if (env_1.config.nodeEnv !== 'production') {
            this.output(this.formatEntry('debug', message, meta));
        }
    }
    info(message, meta) {
        this.output(this.formatEntry('info', message, meta));
    }
    warn(message, meta) {
        this.output(this.formatEntry('warn', message, meta));
    }
    error(message, meta) {
        this.output(this.formatEntry('error', message, meta));
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map