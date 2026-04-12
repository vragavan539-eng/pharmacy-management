const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
  drug:         { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
  drugName:     String,
  dosage:       String,
  frequency:    String,
  duration:     String,
  quantity:     { type: Number, required: true, min: 1 },
  instructions: String,
  unitPrice:    { type: Number, default: 0 },
  totalPrice:   { type: Number, default: 0 },
  dispensed:    { type: Boolean, default: false },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true },  // auto RX-000001

  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },

  doctor: {
    name:          String,
    qualification: String,
    license:       String,
    hospital:      String,
    phone:         String,
  },

  items: [prescriptionItemSchema],

  status: {
    type: String,
    enum: ['pending', 'verified', 'dispensed', 'partial', 'cancelled'],
    default: 'pending',
  },

  prescriptionDate: { type: Date, default: Date.now },
  dispensedDate:    Date,
  dispensedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  notes:        String,
  imageUrl:     String,     // scanned image path
  aiExtracted:  { type: Boolean, default: false },
  aiConfidence: Number,

  totalAmount:  { type: Number, default: 0 },
  refillCount:  { type: Number, default: 0 },
  maxRefills:   { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Auto-generate prescriptionId and compute total
prescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX-${String(count + 1).padStart(6, '0')}`;
  }
  this.totalAmount = this.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  next();
});

prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
