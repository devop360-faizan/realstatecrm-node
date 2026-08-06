const { Router } = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');

const router = Router();

router.use('/v1/auth', authRoutes);
router.use('/v1/admin', adminRoutes);

module.exports = router;
