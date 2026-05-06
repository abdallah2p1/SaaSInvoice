const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    phone:   { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
