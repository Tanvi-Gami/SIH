const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/applicationsController');

router.use(authenticate);

router.post('/', authorize('student'), ctrl.apply);
router.get('/mine', authorize('student'), ctrl.myApplications);

router.get('/applicants', authorize('industry'), ctrl.listApplicants);
router.patch('/:id/status', authorize('industry'), ctrl.updateStatus);
router.get('/funnel', authorize('industry'), ctrl.recruitmentFunnel);

module.exports = router;
