const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/studentsController');

router.get('/skills/catalog', ctrl.listAllSkills);
router.get('/career-tracks', ctrl.listCareerTracks);
router.get('/career-tracks/:trackId/skills', ctrl.getCareerTrackSkills);
router.get('/portfolio/:studentId', ctrl.getPortfolio); // public-style showcase

router.use(authenticate);

router.get('/profile', authorize('student'), ctrl.getProfile);
router.put('/profile', authorize('student'), ctrl.updateProfile);
router.get('/profile/:studentId', ctrl.getProfile); // industry/faculty/institution viewing a candidate

router.get('/skills', authorize('student'), ctrl.listSkills);
router.get('/skills/:studentId', ctrl.listSkills);
router.post('/skills', authorize('student'), ctrl.upsertSkill);
router.delete('/skills/:skillId', authorize('student'), ctrl.deleteSkill);

router.get('/projects', authorize('student'), ctrl.listProjects);
router.get('/projects/:studentId', ctrl.listProjects);
router.post('/projects', authorize('student'), ctrl.addProject);
router.delete('/projects/:projectId', authorize('student'), ctrl.deleteProject);

router.get('/certifications', authorize('student'), ctrl.listCertifications);
router.get('/certifications/:studentId', ctrl.listCertifications);
router.post('/certifications', authorize('student'), ctrl.addCertification);

router.post('/assessment', authorize('student'), ctrl.submitAssessment);
router.get('/assessment', authorize('student'), ctrl.listAssessments);
router.get('/assessment/:studentId', ctrl.listAssessments);

router.get('/applications/summary', authorize('student'), ctrl.applicationsSummary);

module.exports = router;
