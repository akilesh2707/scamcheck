"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyze_controller_1 = require("../controllers/analyze.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const analyze_validator_1 = require("../validators/analyze.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.optionalAuth, rateLimit_middleware_1.rateLimit, (0, validation_middleware_1.validate)(analyze_validator_1.analyzeSchema), analyze_controller_1.analyzeController.analyze);
router.get('/history', auth_middleware_1.optionalAuth, rateLimit_middleware_1.rateLimit, analyze_controller_1.analyzeController.getHistory);
router.get('/:id', auth_middleware_1.optionalAuth, rateLimit_middleware_1.rateLimit, analyze_controller_1.analyzeController.getReport);
exports.default = router;
//# sourceMappingURL=analyze.routes.js.map