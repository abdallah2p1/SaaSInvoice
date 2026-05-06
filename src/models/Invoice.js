const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  desc:  { type: String, required: true },
  qty:   { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client:   { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    invoiceNumber: { type: String, required: true },
    items:    { type: [itemSchema], required: true },
    status:   { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
    dueDate:  { type: Date, required: true },
    notes:    { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual: calculate total from items
invoiceSchema.virtual('total').get(function () {
  return this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
});

invoiceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
