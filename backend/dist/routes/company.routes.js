"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/verify', auth_middleware_1.optionalAuth, rateLimit_middleware_1.rateLimit, company_controller_1.companyController.verify);
exports.default = router;
//# sourceMappingURL=company.routes.js.map