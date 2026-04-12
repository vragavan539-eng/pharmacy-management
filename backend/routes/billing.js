const express = require('express');
const router  = express.Router();
const Bill    = require('../models/Bill');
const Drug    = require('../models/Drug');
const { auth } = require('../middleware/auth');

// GET /api/billing
router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 15, startDate, endDate, paymentMethod, status } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status)        query.paymentStatus = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('generatedBy', 'name')
      .skip(skip).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ bills, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
});

// GET /api/billing/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patient', 'firstName lastName patientId phone')
      .populate('generatedBy', 'name');
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (err) { next(err); }
});

// POST /api/billing
router.post('/', auth, async (req, res, next) => {
  try {
    const { items = [], discount = 0, ...rest } = req.body;

    // Compute item totals
    const processedItems = items.map(item => ({
      ...item,
      totalPrice: (item.unitPrice * item.quantity) - (item.discount || 0),
    }));

    const subtotal = processedItems.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    const total    = subtotal - discount;
    const change   = Math.max((rest.amountPaid || 0) - total, 0);

    const bill = await Bill.create({
      ...rest,
      items: processedItems,
      subtotal, discount, total, change,
      generatedBy: req.user._id,
    });

    // Deduct stock for each item
    for (const item of processedItems) {
      if (item.drug) {
        await Drug.findByIdAndUpdate(item.drug, { $inc: { quantity: -item.quantity } });
      }
    }

    res.status(201).json(bill);
  } catch (err) { next(err); }
});

// GET /api/billing/summary/today
router.get('/summary/today', auth, async (req, res, next) => {
  try {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const bills = await Bill.find({ createdAt: { $gte: today, $lt: tomorrow } });
    const revenue = bills.reduce((s, b) => s + b.total, 0);
    const byMethod = bills.reduce((acc, b) => {
      acc[b.paymentMethod] = (acc[b.paymentMethod] || 0) + b.total;
      return acc;
    }, {});

    res.json({ count: bills.length, revenue, byMethod });
  } catch (err) { next(err); }
});

module.exports = router;
