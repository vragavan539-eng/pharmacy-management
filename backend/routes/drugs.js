const express = require('express');
const router  = express.Router();
const Drug    = require('../models/Drug');
const { auth, authorize } = require('../middleware/auth');

// GET /api/drugs  — list with filters + pagination
router.get('/', auth, async (req, res, next) => {
  try {
    const { search, category, lowStock, expiring, page = 1, limit = 15 } = req.query;
    const query = { active: true };

    if (search)   query.$text = { $search: search };
    if (category) query.category = category;
    if (lowStock === 'true') query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    if (expiring === 'true') {
      const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      query.expiryDate = { $lte: in30, $gte: new Date() };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Drug.countDocuments(query);
    const drugs = await Drug.find(query)
      .skip(skip).limit(Number(limit))
      .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 });

    res.json({ drugs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
});

// GET /api/drugs/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const drug = await Drug.findById(req.params.id);
    if (!drug || !drug.active) return res.status(404).json({ error: 'Drug not found' });
    res.json(drug);
  } catch (err) { next(err); }
});

// POST /api/drugs
router.post('/', auth, authorize('admin', 'manager', 'pharmacist'), async (req, res, next) => {
  try {
    const drug = await Drug.create(req.body);
    res.status(201).json(drug);
  } catch (err) { next(err); }
});

// PUT /api/drugs/:id
router.put('/:id', auth, authorize('admin', 'manager', 'pharmacist'), async (req, res, next) => {
  try {
    const drug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!drug) return res.status(404).json({ error: 'Drug not found' });
    res.json(drug);
  } catch (err) { next(err); }
});

// DELETE /api/drugs/:id  (soft delete)
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const drug = await Drug.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!drug) return res.status(404).json({ error: 'Drug not found' });
    res.json({ message: 'Drug removed successfully' });
  } catch (err) { next(err); }
});

// PATCH /api/drugs/:id/stock  — update stock quantity
router.patch('/:id/stock', auth, authorize('admin', 'manager', 'pharmacist'), async (req, res, next) => {
  try {
    const { quantity, operation = 'set' } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: 'Quantity is required' });

    const drug = await Drug.findById(req.params.id);
    if (!drug) return res.status(404).json({ error: 'Drug not found' });

    if (operation === 'add')      drug.quantity += Number(quantity);
    else if (operation === 'subtract') drug.quantity = Math.max(0, drug.quantity - Number(quantity));
    else                          drug.quantity = Number(quantity);

    await drug.save();
    res.json(drug);
  } catch (err) { next(err); }
});

// GET /api/drugs/stats/summary
router.get('/stats/summary', auth, async (req, res, next) => {
  try {
    const [total, lowStock, expired, byCategory] = await Promise.all([
      Drug.countDocuments({ active: true }),
      Drug.countDocuments({ active: true, $expr: { $lte: ['$quantity', '$minStockLevel'] } }),
      Drug.countDocuments({ active: true, expiryDate: { $lt: new Date() } }),
      Drug.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.json({ total, lowStock, expired, byCategory });
  } catch (err) { next(err); }
});

module.exports = router;
