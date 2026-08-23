"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const start = async () => {
    try {
        await (0, database_1.connectDatabase)();
        await (0, rateLimit_middleware_1.initRateLimiter)();
        const app = (0, app_1.createApp)();
        app.listen(env_1.config.port, () => {
            console.log(`Server running on port ${env_1.config.port} in ${env_1.config.nodeEnv} mode`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map