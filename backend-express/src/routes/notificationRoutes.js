const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/notificationsController');

router.use(authenticate);
router.get('/', ctrl.list);
router.patch('/:id/read', ctrl.markRead);
router.patch('/read-all', ctrl.markAllRead);

module.exports = router;
