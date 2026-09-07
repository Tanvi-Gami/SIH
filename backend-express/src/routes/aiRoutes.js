const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');
const ctrl = require('../controllers/aiController');

const resumeUploader = makeUploader('resumes');

router.use(authenticate);

router.post('/resume/analyze', authorize('student'), resumeUploader.single('resume'), ctrl.analyzeResume);
router.post('/resume/confirm', authorize('student'), ctrl.confirmResumeData);
router.get('/skill-gap', authorize('student'), ctrl.skillGap);
router.get('/recommendations', authorize('student'), ctrl.recommendations);
router.post('/match-preview', authorize('student'), ctrl.matchPreview);
router.post('/career-guidance', authorize('student'), ctrl.careerGuidance);
router.post('/chat', ctrl.chat);
router.get('/chat/history', ctrl.chatHistory);
router.get('/industry-skill-analysis', ctrl.industrySkillAnalysis);
router.get('/search', ctrl.semanticSearch);

module.exports = router;
