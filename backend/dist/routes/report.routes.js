"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.get('/:id', auth_middleware_1.optionalAuth, rateLimit_middleware_1.rateLimit, report_controller_1.reportController.getReport);
router.get('/', auth_middleware_1.authenticate, rateLimit_middleware_1.rateLimit, report_controller_1.reportController.getHistory);
exports.default = router;
//# sourceMappingURL=report.routes.js.map