const express      = require('express');
const router       = express.Router();
const Drug         = require('../models/Drug');
const Patient      = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Bill         = require('../models/Bill');
const { auth }     = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const now       = new Date();
    const today     = new Date(now); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalDrugs, lowStockCount, expiredCount,
      totalPatients, pendingRx,
      todayBills, monthBills,
    ] = await Promise.all([
      Drug.countDocuments({ active: true }),
      Drug.countDocuments({ active: true, $expr: { $lte: ['$quantity', '$minStockLevel'] } }),
      Drug.countDocuments({ active: true, expiryDate: { $lt: now } }),
      Patient.countDocuments({ active: true }),
      Prescription.countDocuments({ status: 'pending' }),
      Bill.find({ createdAt: { $gte: today } }),
      Bill.find({ createdAt: { $gte: thisMonth } }),
    ]);

    const todayRevenue = todayBills.reduce((s, b) => s + b.total, 0);
    const monthRevenue = monthBills.reduce((s, b) => s + b.total, 0);

    // 7-day revenue trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d    = new Date(today); d.setDate(d.getDate() - i);
      const next = new Date(d);     next.setDate(next.getDate() + 1);
      const dayBills = await Bill.find({ createdAt: { $gte: d, $lt: next } });
      trend.push({
        date:    d.toISOString().slice(0, 10),
        revenue: dayBills.reduce((s, b) => s + b.total, 0),
        count:   dayBills.length,
      });
    }

    // Top selling drugs (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentBills   = await Bill.find({ createdAt: { $gte: thirtyDaysAgo } });
    const drugSales = {};
    recentBills.forEach(bill =>
      bill.items.forEach(item => {
        drugSales[item.name] = (drugSales[item.name] || 0) + item.quantity;
      })
    );
    const topDrugs = Object.entries(drugSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    res.json({
      totalDrugs, lowStockCount, expiredCount,
      totalPatients, pendingRx,
      todayRevenue, monthRevenue,
      todayBillCount: todayBills.length,
      trend, topDrugs,
    });
  } catch (err) { next(err); }
});

module.exports = router;
