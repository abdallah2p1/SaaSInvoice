const Invoice = require('../models/Invoice');
const Client  = require('../models/Client');

// Helper: generate invoice number like INV-001
const generateInvoiceNumber = async (userId) => {
  const count = await Invoice.countDocuments({ user: userId });
  return `INV-${String(count + 1).padStart(3, '0')}`;
};

// GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('client', 'name email company')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/invoices/stats — dashboard numbers
exports.getStats = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id });

    const stats = {
      total:       0,
      paid:        0,
      unpaid:      0,
      overdueCount: 0,
    };

    invoices.forEach((inv) => {
      const amount = inv.items.reduce((s, i) => s + i.qty * i.price, 0);
      stats.total += amount;
      if (inv.status === 'paid')   stats.paid   += amount;
      if (inv.status === 'unpaid') stats.unpaid += amount;
      if (inv.status === 'overdue') stats.overdueCount++;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/invoices/:id
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id })
      .populate('client', 'name email company phone');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    const { clientId, items, dueDate, notes } = req.body;

    if (!clientId || !items?.length || !dueDate)
      return res.status(400).json({ message: 'clientId, items, and dueDate are required' });

    // Make sure the client belongs to this user
    const client = await Client.findOne({ _id: clientId, user: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const invoiceNumber = await generateInvoiceNumber(req.user.id);

    const invoice = await Invoice.create({
      user: req.user.id,
      client: clientId,
      invoiceNumber,
      items,
      dueDate,
      notes,
    });

    await invoice.populate('client', 'name email company');
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name email company');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/invoices/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['paid', 'unpaid', 'overdue'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
