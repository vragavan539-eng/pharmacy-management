const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },   // auto-generated PAT-000001

  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },

  dateOfBirth: Date,
  gender:      { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup:  String,

  phone: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },

  address: {
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
  },

  allergies:         [String],
  chronicConditions: [String],

  emergencyContact: {
    name:     String,
    phone:    String,
    relation: String,
  },

  insuranceInfo: {
    provider:     String,
    policyNumber: String,
    expiryDate:   Date,
  },

  notes:  String,
  active: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Auto-generate patientId
patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  return new Date().getFullYear() - new Date(this.dateOfBirth).getFullYear();
});

// Text search index
patientSchema.index({ firstName: 'text', lastName: 'text', phone: 'text', patientId: 'text', email: 'text' });
patientSchema.index({ active: 1 });

module.exports = mongoose.model('Patient', patientSchema);
