const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/opportunitiesController');

router.get('/jobs', ctrl.listJobs);
router.get('/jobs/:id', ctrl.getJob);
router.post('/jobs', authenticate, authorize('industry'), ctrl.createJob);
router.patch('/jobs/:id/status', authenticate, authorize('industry'), ctrl.updateJobStatus);

router.get('/internships', ctrl.listInternships);
router.get('/internships/:id', ctrl.getInternship);
router.post('/internships', authenticate, authorize('industry'), ctrl.createInternship);
router.patch('/internships/:id/status', authenticate, authorize('industry'), ctrl.updateInternshipStatus);

router.get('/my-opportunities', authenticate, authorize('industry'), ctrl.listMyOpportunities);

module.exports = router;
