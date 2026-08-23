"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const website_controller_1 = require("../controllers/website.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const url_validator_1 = require("../validators/url.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/analyze', auth_middleware_1.optionalAuth, rateLimit_middleware_1.rateLimit, (0, validation_middleware_1.validate)(url_validator_1.urlSchema), website_controller_1.websiteController.analyze);
exports.default = router;
//# sourceMappingURL=website.routes.js.map