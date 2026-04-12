const express      = require('express');
const router       = express.Router();
const Groq         = require('groq-sdk');
const Drug         = require('../models/Drug');
const Patient      = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Bill         = require('../models/Bill');
const { auth }     = require('../middleware/auth');

const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

const parseJSON = (text) => {
  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean);
};

const chat = async (system, userContent, maxTokens = 1500) => {
  const res = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: userContent },
    ],
  });
  return res.choices[0].message.content;
};

// ── 1. Drug Interaction Checker ───────────────────────────────────────────────
router.post('/interactions', auth, async (req, res, next) => {
  try {
    const { drugs } = req.body;
    if (!drugs || drugs.length < 2)
      return res.status(400).json({ error: 'Provide at least 2 drug names' });

    const text = await chat(
      `You are a clinical pharmacist AI expert. Analyze drug-drug interactions with clinical accuracy.
Respond ONLY with valid JSON — no preamble, no markdown.
Format:
{
  "interactions": [{
    "drug1": "string",
    "drug2": "string",
    "severity": "mild|moderate|severe|contraindicated",
    "mechanism": "string",
    "clinicalEffect": "string",
    "recommendation": "string",
    "references": "string"
  }],
  "overallRisk": "safe|caution|avoid",
  "summary": "string"
}`,
      `Check interactions for: ${drugs.join(', ')}`,
      1500
    );

    res.json(parseJSON(text));
  } catch (err) { next(err); }
});

// ── 2. AI Pharmacist Chatbot ──────────────────────────────────────────────────
router.post('/chat', auth, async (req, res, next) => {
  try {
    const { messages = [], context = {} } = req.body;
    if (!messages.length) return res.status(400).json({ error: 'Messages are required' });

    const result = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: `You are PharmAI — an intelligent assistant built specifically for pharmacists and pharmacy staff.

Your expertise covers:
• Drug information: dosages, mechanisms, pharmacokinetics, contraindications
• Drug interactions and adverse effects
• Patient counseling talking points
• Inventory management and stock decisions
• Regulatory compliance (Schedule H, H1, X drugs in India)
• Generic substitutions and bioequivalence
• Storage conditions and stability

Current pharmacy context: ${JSON.stringify(context)}

Guidelines:
- Be concise, accurate, and professionally worded
- Always recommend consulting a physician/specialist for clinical decisions
- Flag any safety concerns prominently
- Use Indian drug brand names where relevant (context is an Indian pharmacy)`,
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    });

    res.json({
      reply: result.choices[0].message.content,
      usage: result.usage,
    });
  } catch (err) { next(err); }
});

// ── 3. Prescription OCR / AI Extraction ──────────────────────────────────────
router.post('/extract-prescription', auth, async (req, res, next) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image data (base64) is required' });

    // Groq vision — llama-4 scout supports images
    const result = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          {
            type: 'text',
            text: `Extract ALL prescription data from this image with maximum accuracy.
Respond ONLY with valid JSON — no extra text:
{
  "doctor": { "name": "", "qualification": "", "license": "", "hospital": "", "phone": "", "address": "" },
  "patient": { "name": "", "age": "", "gender": "", "weight": "" },
  "prescriptionDate": "",
  "items": [{
    "drugName": "", "genericName": "", "dosage": "",
    "frequency": "", "duration": "", "quantity": 0,
    "route": "", "instructions": ""
  }],
  "diagnosis": "",
  "notes": "",
  "refills": 0,
  "confidence": 0.0
}`,
          },
        ],
      }],
    });

    const data = parseJSON(result.choices[0].message.content);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// ── 4. Demand Forecasting ─────────────────────────────────────────────────────
router.post('/forecast', auth, async (req, res, next) => {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [bills, drugs] = await Promise.all([
      Bill.find({ createdAt: { $gte: ninetyDaysAgo } }),
      Drug.find({ active: true }).select('name quantity minStockLevel category expiryDate unitPrice'),
    ]);

    const salesMap = {};
    bills.forEach(bill =>
      bill.items.forEach(item => {
        salesMap[item.name] = (salesMap[item.name] || 0) + (item.quantity || 0);
      })
    );

    const inventoryData = drugs.slice(0, 40).map(d => ({
      name:            d.name,
      category:        d.category,
      currentStock:    d.quantity,
      minLevel:        d.minStockLevel,
      unitPrice:       d.unitPrice,
      last90DaysSales: salesMap[d.name] || 0,
      expiresInDays:   d.expiryDate
        ? Math.ceil((new Date(d.expiryDate) - new Date()) / 86400000)
        : null,
    }));

    const text = await chat(
      'You are a pharmacy inventory analyst AI. Provide data-driven demand forecasting. Respond ONLY with valid JSON.',
      `Analyze this pharmacy inventory and 90-day sales data. Generate a 30-day demand forecast.

Data: ${JSON.stringify(inventoryData)}

Respond with JSON:
{
  "forecast": [{
    "drugName": "",
    "currentStock": 0,
    "predictedDemand30Days": 0,
    "reorderQty": 0,
    "urgency": "critical|high|medium|low",
    "reason": "",
    "estimatedStockoutDate": ""
  }],
  "insights": ["..."],
  "criticalItems": ["..."],
  "totalReorderValue": 0,
  "seasonalNotes": ""
}`,
      2500
    );

    res.json(parseJSON(text));
  } catch (err) { next(err); }
});

// ── 5. Smart NLP Drug Search ──────────────────────────────────────────────────
router.post('/smart-search', auth, async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const textResults = await Drug.find(
      { $text: { $search: query }, active: true },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(6);

    if (textResults.length >= 3) return res.json({ results: textResults, aiEnhanced: false });

    const text = await chat(
      'You are a pharmacy search assistant. Extract structured drug search terms. Respond ONLY with JSON.',
      `Extract search terms from this pharmacy query: "${query}"
Respond: { "drugNames": [], "genericNames": [], "categories": [], "conditions": [], "symptoms": [] }`,
      400
    );

    const terms    = parseJSON(text);
    const allTerms = [
      ...(terms.drugNames    || []),
      ...(terms.genericNames || []),
      ...(terms.conditions   || []),
      ...(terms.symptoms     || []),
    ].map(t => new RegExp(t, 'i'));

    const aiResults = await Drug.find({
      active: true,
      $or: [
        { name:        { $in: allTerms } },
        { genericName: { $in: allTerms } },
        { category:    { $in: terms.categories || [] } },
        { sideEffects: { $in: allTerms } },
        { description: { $in: allTerms } },
      ],
    }).limit(10);

    const combined = [
      ...textResults,
      ...aiResults.filter(r => !textResults.some(t => t._id.equals(r._id))),
    ];

    res.json({ results: combined, aiEnhanced: true, extractedTerms: terms });
  } catch (err) { next(err); }
});

// ── 6. Patient Medication Summary ─────────────────────────────────────────────
router.get('/patient-summary/:patientId', auth, async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate('items.drug', 'name category')
      .sort({ createdAt: -1 }).limit(10);

    const text = await chat(
      'You are a clinical pharmacist. Generate concise, professional medication summaries for pharmacy records.',
      `Generate a medication summary for pharmacy staff:

Patient: ${patient.firstName} ${patient.lastName}
Age: ${patient.age || 'Unknown'}
Gender: ${patient.gender || 'Unknown'}
Blood Group: ${patient.bloodGroup || 'Unknown'}
Known Allergies: ${patient.allergies?.join(', ') || 'None recorded'}
Chronic Conditions: ${patient.chronicConditions?.join(', ') || 'None recorded'}

Recent Prescriptions (last 10):
${JSON.stringify(prescriptions.map(p => ({
  date:   p.prescriptionDate,
  status: p.status,
  doctor: p.doctor?.name,
  drugs:  p.items.map(i => ({ name: i.drugName, dosage: i.dosage, qty: i.quantity })),
})))}

Provide:
1. Current medication profile
2. Allergy / interaction warnings
3. Adherence observations
4. Counseling points for next visit`,
      900
    );

    res.json({ summary: text, patient: patient.fullName, generatedAt: new Date() });
  } catch (err) { next(err); }
});

// ── 7. Drug Information Lookup ────────────────────────────────────────────────
router.post('/drug-info', auth, async (req, res, next) => {
  try {
    const { drugName } = req.body;
    if (!drugName) return res.status(400).json({ error: 'Drug name is required' });

    const text = await chat(
      'You are a clinical pharmacist. Provide accurate drug information. Respond ONLY with JSON.',
      `Provide comprehensive drug information for: ${drugName}
JSON format:
{
  "name": "", "genericName": "", "category": "", "mechanism": "",
  "indications": [], "dosage": { "adult": "", "pediatric": "", "renal": "" },
  "sideEffects": { "common": [], "serious": [] },
  "contraindications": [], "interactions": [],
  "storageConditions": "", "scheduleIndia": "",
  "counselingPoints": []
}`,
      1000
    );

    res.json(parseJSON(text));
  } catch (err) { next(err); }
});

module.exports = router;