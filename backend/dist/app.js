"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const analyze_routes_1 = __importDefault(require("./routes/analyze.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const suitability_routes_1 = __importDefault(require("./routes/suitability.routes"));
const skillGap_routes_1 = __importDefault(require("./routes/skillGap.routes"));
const alternatives_routes_1 = __importDefault(require("./routes/alternatives.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const website_routes_1 = __importDefault(require("./routes/website.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.config.nodeEnv === 'production' ? false : true,
        credentials: true,
    }));
    app.use((0, morgan_1.default)(env_1.config.nodeEnv === 'production' ? 'combined' : 'dev'));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.get('/api/health', (req, res) => {
        res.json({ success: true, service: 'scamcheck-backend', status: 'healthy' });
    });
    app.get('/api', (req, res) => {
        res.json({
            name: 'ScamCheck API',
            version: '1.0.0',
            status: 'operational',
        });
    });
    app.use('/api/analyze', analyze_routes_1.default);
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/analyze/suitability', suitability_routes_1.default);
    app.use('/api/analyze/skill-gap', skillGap_routes_1.default);
    app.use('/api/find/alternatives', alternatives_routes_1.default);
    app.use('/api/verify/payment', payment_routes_1.default);
    app.use('/api/website', website_routes_1.default);
    app.use('/api/company', company_routes_1.default);
    app.use('/api/report', report_routes_1.default);
    app.use(error_middleware_1.notFoundHandler);
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
const startServer = async () => {
    const { connectDatabase } = await Promise.resolve().then(() => __importStar(require('./config/database')));
    await connectDatabase();
    await (0, rateLimit_middleware_1.initRateLimiter)();
    const app = (0, exports.createApp)();
    app.listen(env_1.config.port, () => {
        console.log(`Server running on port ${env_1.config.port} in ${env_1.config.nodeEnv} mode`);
    });
};
exports.startServer = startServer;
if (require.main === module) {
    (0, exports.startServer)().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=app.js.map