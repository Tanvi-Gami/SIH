const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/institutionsController');

router.use(authenticate, authorize('institution'));

router.get('/profile', ctrl.getMyInstitution);
router.put('/profile', ctrl.updateMyInstitution);
router.get('/students', ctrl.listStudents);
router.get('/analytics/overview', ctrl.overview);
router.get('/analytics/industry-demand', ctrl.industryDemand);
router.get('/analytics/skill-gaps', ctrl.skillGaps);

module.exports = router;
