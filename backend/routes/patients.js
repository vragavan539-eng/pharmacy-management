const express = require('express');
const router  = express.Router();
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

// GET /api/patients
router.get('/', auth, async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const query = { active: true };
    if (search) query.$text = { $search: search };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .skip(skip).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ patients, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
});

// GET /api/patients/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.active) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) { next(err); }
});

// POST /api/patients
router.post('/', auth, async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) { next(err); }
});

// PUT /api/patients/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) { next(err); }
});

// DELETE /api/patients/:id  (soft delete)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Patient.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Patient removed' });
  } catch (err) { next(err); }
});

// GET /api/patients/:id/history  — prescription history
router.get('/:id/history', auth, async (req, res, next) => {
  try {
    const Prescription = require('../models/Prescription');
    const prescriptions = await Prescription.find({ patient: req.params.id })
      .populate('items.drug', 'name sellingPrice')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(prescriptions);
  } catch (err) { next(err); }
});

module.exports = router;
