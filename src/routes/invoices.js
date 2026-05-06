const router = require('express').Router();
const auth   = require('../middleware/auth');
const {
  getInvoices, getInvoice, createInvoice,
  updateInvoice, updateStatus, deleteInvoice, getStats
} = require('../controllers/invoiceController');

router.use(auth);

router.get('/stats',       getStats);       // GET /api/invoices/stats
router.get('/',            getInvoices);
router.get('/:id',         getInvoice);
router.post('/',           createInvoice);
router.put('/:id',         updateInvoice);
router.patch('/:id/status', updateStatus);  // PATCH /api/invoices/:id/status
router.delete('/:id',      deleteInvoice);

module.exports = router;
