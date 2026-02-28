"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificate_controller_1 = require("../controllers/certificate.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../helpers/validation");
const router = (0, express_1.Router)();
router.get('/my', auth_1.authenticate, (0, auth_1.requireRole)('student'), certificate_controller_1.myCertificates);
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('student'), (0, validation_1.validate)(validation_1.issueCertSchema), certificate_controller_1.issueCertificate);
exports.default = router;
//# sourceMappingURL=certificate.routes.js.map