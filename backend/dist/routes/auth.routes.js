"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/register', rateLimit_middleware_1.rateLimit, (0, validation_middleware_1.validate)(auth_validator_1.registerSchema), auth_controller_1.authController.register);
router.post('/login', rateLimit_middleware_1.rateLimit, (0, validation_middleware_1.validate)(auth_validator_1.loginSchema), auth_controller_1.authController.login);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.me);
router.put('/profile', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(auth_validator_1.updateProfileSchema), auth_controller_1.authController.updateProfile);
router.put('/user-profile', auth_middleware_1.authenticate, auth_controller_1.authController.updateUserProfile);
router.get('/user-profile', auth_middleware_1.authenticate, auth_controller_1.authController.getUserProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map