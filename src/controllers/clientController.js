const Client = require('../models/Client');

// GET /api/clients — get all clients for logged-in user
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(520).json({ message: 'Server error' });
  }
};

// GET /api/clients/:id
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/clients
exports.createClient = async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    const client = await Client.create({ user: req.user.id, name, email, company, phone });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/clients/:id

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
