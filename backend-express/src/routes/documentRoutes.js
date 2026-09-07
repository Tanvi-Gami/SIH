const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');
const ctrl = require('../controllers/documentsController');

const uploader = makeUploader('documents');

router.use(authenticate);
router.post('/upload', uploader.single('file'), ctrl.upload);
router.get('/mine', ctrl.listMine);

module.exports = router;
