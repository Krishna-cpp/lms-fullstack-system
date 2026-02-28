"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('admin'), user_controller_1.listUsers);
router.get('/:id', auth_1.authenticate, user_controller_1.getUserById);
router.put('/:id', auth_1.authenticate, (0, validation_1.validate)(validation_1.updateUserSchema), user_controller_1.updateUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map