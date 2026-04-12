const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  drug:        { type: String, required: true },
  severity:    { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
  description: String,
}, { _id: false });

const drugSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  genericName:  { type: String, trim: true },
  brand:        { type: String, trim: true },
  category: {
    type: String,
    enum: ['antibiotic','analgesic','antihypertensive','antidiabetic','antidepressant',
           'antihistamine','vitamin','antacid','antifungal','antiviral','cardiovascular',
           'respiratory','neurological','hormonal','other'],
    default: 'other',
  },
  dosageForm:   { type: String, enum: ['tablet','capsule','syrup','injection','cream','drops','inhaler','patch','other'], default: 'tablet' },
  strength:     String,
  manufacturer: String,
  batchNumber:  String,

  // Stock
  quantity:       { type: Number, default: 0, min: 0 },
  minStockLevel:  { type: Number, default: 10 },
  maxStockLevel:  { type: Number, default: 1000 },

  // Dates
  expiryDate:     Date,
  manufactureDate:Date,

  // Pricing
  unitPrice:    { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },

  // Location
  location: String,  // shelf / rack

  // Flags
  requiresPrescription: { type: Boolean, default: false },
  controlled:           { type: Boolean, default: false },
  active:               { type: Boolean, default: true },

  // Clinical data
  interactions:       [interactionSchema],
  sideEffects:        [String],
  contraindications:  [String],
  storageConditions:  String,
  description:        String,

  // Identifiers
  barcode: { type: String, unique: true, sparse: true },

  // AI
  aiTags: [String],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Indexes
drugSchema.index({ name: 'text', genericName: 'text', brand: 'text', description: 'text' });
drugSchema.index({ expiryDate: 1 });
drugSchema.index({ quantity: 1 });
drugSchema.index({ category: 1 });
drugSchema.index({ active: 1 });

// Virtuals
drugSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minStockLevel;
});
drugSchema.virtual('isExpired').get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});
drugSchema.virtual('expiresInDays').get(function () {
  if (!this.expiryDate) return null;
  return Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
});
drugSchema.virtual('profitMargin').get(function () {
  if (!this.unitPrice) return 0;
  return Math.round(((this.sellingPrice - this.unitPrice) / this.unitPrice) * 100);
});

module.exports = mongoose.model('Drug', drugSchema);
