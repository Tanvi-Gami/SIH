const router = require('express').Router();
const ctrl = require('../controllers/programsController');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

module.exports = router;
