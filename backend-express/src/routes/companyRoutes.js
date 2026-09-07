const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/companiesController');

router.get('/', ctrl.listCompanies);
router.get('/:id', ctrl.getCompany);

router.get('/me/profile', authenticate, authorize('industry'), ctrl.getMyCompany);
router.put('/me/profile', authenticate, authorize('industry'), ctrl.updateMyCompany);
router.get('/me/candidates', authenticate, authorize('industry'), ctrl.searchCandidates);

module.exports = router;
