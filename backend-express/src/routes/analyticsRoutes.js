const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');

router.get('/platform', ctrl.platformStats);

module.exports = router;
