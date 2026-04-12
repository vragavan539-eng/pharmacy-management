const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  drug:       { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
  name:       String,
  quantity:   { type: Number, required: true, min: 1 },
  unitPrice:  { type: Number, required: true, min: 0 },
  discount:   { type: Number, default: 0 },
  tax:        { type: Number, default: 0 },
  totalPrice: Number,
}, { _id: false });

const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true },   // BILL-2024-000001

  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: String,  // walk-in customer name

  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },

  items: [billItemSchema],

  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax:      { type: Number, default: 0 },
  total:    { type: Number, default: 0 },

  amountPaid: { type: Number, default: 0 },
  change:     { type: Number, default: 0 },

  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'insurance', 'credit'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial', 'refunded'],
    default: 'paid',
  },

  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
}, { timestamps: true });

// Auto-generate bill number
billSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Bill').countDocuments();
    const year  = new Date().getFullYear();
    this.billNumber = `BILL-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

billSchema.index({ createdAt: -1 });
billSchema.index({ patient: 1 });
billSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Bill', billSchema);
