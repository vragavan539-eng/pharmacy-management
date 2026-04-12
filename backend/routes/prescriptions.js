const express      = require('express');
const router       = express.Router();
const Prescription = require('../models/Prescription');
const Drug         = require('../models/Drug');
const { auth }     = require('../middleware/auth');

// GET /api/prescriptions
router.get('/', auth, async (req, res, next) => {
  try {
    const { status, patient, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status)  query.status  = status;
    if (patient) query.patient = patient;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName patientId phone')
      .populate('items.drug', 'name sellingPrice quantity')
      .populate('dispensedBy', 'name')
      .skip(skip).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ prescriptions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
});

// GET /api/prescriptions/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const rx = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('items.drug')
      .populate('dispensedBy', 'name role');
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) { next(err); }
});

// POST /api/prescriptions
router.post('/', auth, async (req, res, next) => {
  try {
    // Enrich items with current drug prices
    const enrichedItems = await Promise.all(
      (req.body.items || []).map(async (item) => {
        if (!item.drug) return item;
        const drug = await Drug.findById(item.drug);
        return {
          ...item,
          drugName:   drug?.name         || item.drugName,
          unitPrice:  drug?.sellingPrice || 0,
          totalPrice: (drug?.sellingPrice || 0) * Number(item.quantity),
        };
      })
    );

    const rx = await Prescription.create({ ...req.body, items: enrichedItems });
    const populated = await rx.populate('patient', 'firstName lastName patientId');
    res.status(201).json(populated);
  } catch (err) { next(err); }
});

// PUT /api/prescriptions/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const rx = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) { next(err); }
});

// PATCH /api/prescriptions/:id/dispense  — dispense and deduct stock
router.patch('/:id/dispense', auth, async (req, res, next) => {
  try {
    const rx = await Prescription.findById(req.params.id).populate('items.drug');
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    if (rx.status === 'dispensed') return res.status(400).json({ error: 'Already dispensed' });
    if (rx.status === 'cancelled') return res.status(400).json({ error: 'Prescription is cancelled' });

    // Check stock availability
    for (const item of rx.items) {
      if (item.drug && item.drug.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.drugName || item.drug.name}. Available: ${item.drug.quantity}, Required: ${item.quantity}` });
      }
    }

    // Deduct stock
    for (const item of rx.items) {
      if (item.drug) {
        await Drug.findByIdAndUpdate(item.drug._id, { $inc: { quantity: -item.quantity } });
        item.dispensed = true;
      }
    }

    rx.status        = 'dispensed';
    rx.dispensedDate = new Date();
    rx.dispensedBy   = req.user._id;
    await rx.save();

    res.json(rx);
  } catch (err) { next(err); }
});

// PATCH /api/prescriptions/:id/cancel
router.patch('/:id/cancel', auth, async (req, res, next) => {
  try {
    const rx = await Prescription.findById(req.params.id);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    if (rx.status === 'dispensed') return res.status(400).json({ error: 'Cannot cancel a dispensed prescription' });
    rx.status = 'cancelled';
    await rx.save();
    res.json(rx);
  } catch (err) { next(err); }
});

module.exports = router;
