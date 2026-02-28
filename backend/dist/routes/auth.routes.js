"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validate)(validation_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validation_1.validate)(validation_1.loginSchema), auth_controller_1.login);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map