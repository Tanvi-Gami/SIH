const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/facultyController');

router.get('/opportunities', ctrl.listOpportunities);
router.get('/opportunities/:id', ctrl.getOpportunity);

router.use(authenticate);

router.get('/profile', authorize('faculty'), ctrl.getProfile);
router.put('/profile', authorize('faculty'), ctrl.updateProfile);
router.get('/profile/:facultyId', ctrl.getProfile);

router.post('/opportunities', authorize('industry'), ctrl.createOpportunity);
router.get('/opportunities/company/applicants', authorize('industry'), ctrl.listApplicantsForCompany);
router.patch('/applications/:id/status', authorize('industry'), ctrl.updateApplicationStatus);

router.post('/applications', authorize('faculty'), ctrl.apply);
router.get('/applications/mine', authorize('faculty'), ctrl.myApplications);

module.exports = router;
