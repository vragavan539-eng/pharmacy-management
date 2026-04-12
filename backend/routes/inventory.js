const express = require('express');
const router  = express.Router();
const Drug    = require('../models/Drug');
const { auth } = require('../middleware/auth');

// GET /api/inventory/alerts  — low stock + expiring + expired
router.get('/alerts', auth, async (req, res, next) => {
  try {
    const now     = new Date();
    const in30    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [lowStock, expiring, expired] = await Promise.all([
      Drug.find({ active: true, $expr: { $lte: ['$quantity', '$minStockLevel'] } })
          .select('name quantity minStockLevel category location').sort({ quantity: 1 }),

      Drug.find({ active: true, expiryDate: { $lte: in30, $gte: now } })
          .select('name expiryDate quantity category batchNumber').sort({ expiryDate: 1 }),

      Drug.find({ active: true, expiryDate: { $lt: now } })
          .select('name expiryDate quantity category batchNumber').sort({ expiryDate: 1 }),
    ]);

    res.json({
      lowStock,
      expiring,
      expired,
      summary: { lowStockCount: lowStock.length, expiringCount: expiring.length, expiredCount: expired.length },
    });
  } catch (err) { next(err); }
});

// GET /api/inventory/report  — full inventory value report
router.get('/report', auth, async (req, res, next) => {
  try {
    const drugs = await Drug.find({ active: true }).select('name category quantity unitPrice sellingPrice');

    const report = drugs.map(d => ({
      name:        d.name,
      category:    d.category,
      quantity:    d.quantity,
      unitPrice:   d.unitPrice,
      sellingPrice:d.sellingPrice,
      stockValue:  d.quantity * d.unitPrice,
      retailValue: d.quantity * d.sellingPrice,
      profit:      d.quantity * (d.sellingPrice - d.unitPrice),
    }));

    const totals = report.reduce((acc, r) => ({
      stockValue:  acc.stockValue  + r.stockValue,
      retailValue: acc.retailValue + r.retailValue,
      profit:      acc.profit      + r.profit,
    }), { stockValue: 0, retailValue: 0, profit: 0 });

    res.json({ items: report, totals, count: report.length });
  } catch (err) { next(err); }
});

module.exports = router;
