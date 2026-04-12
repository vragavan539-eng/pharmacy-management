import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Badge, PageHeader } from '../components/UI';
import { COLORS } from '../utils/constants';
import api from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'chat',         label: '🤖 AI Assistant' },
  { key: 'interactions', label: '⚗️ Drug Interactions' },
  { key: 'forecast',     label: '📊 Demand Forecast' },
  { key: 'ocr',          label: '🔬 Prescription OCR' },
];

export default function AIFeatures() {
  const [tab, setTab] = useState('chat');

  return (
    <div>
      <PageHeader title="AI Features" subtitle="Powered by Claude AI — Anthropic" />

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', padding: 4, borderRadius: 12, border: `1px solid ${COLORS.border}`, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
            background: tab === t.key ? COLORS.primary : 'transparent',
            color: tab === t.key ? '#fff' : COLORS.muted,
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'chat'         && <ChatTab />}
      {tab === 'interactions' && <InteractionsTab />}
      {tab === 'forecast'     && <ForecastTab />}
      {tab === 'ocr'          && <OcrTab />}
    </div>
  );
}

// ── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm PharmAI 🤖 — your intelligent pharmacy assistant.\n\nI can help with:\n• Drug information, dosages & side effects\n• Drug interaction queries\n• Inventory & stock guidance\n• Regulatory & compliance advice\n\nWhat do you need help with today?"
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput(''); setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { messages: [...messages, userMsg] });
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `⚠️ Error: ${err.error || 'Service unavailable'}` }]);
    } finally { setLoading(false); }
  };

  const QUICK = ['What drugs interact with Warfarin?', 'Low stock recommendations', 'Paracetamol dosage for adults', 'Side effects of Metformin'];

  return (
    <Card>
      {/* Messages */}
      <div style={{ height: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0', marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 8 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 30, height: 30, borderRadius: 9, background: COLORS.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '76%', padding: '11px 15px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role === 'user' ? COLORS.primary : '#f4f8f6',
              color: m.role === 'user' ? '#fff' : COLORS.text,
              fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap',
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: COLORS.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ padding: '11px 15px', background: '#f4f8f6', borderRadius: 14, fontSize: 13, color: COLORS.muted }}>Thinking…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => setInput(q)} style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${COLORS.border}`, background: '#fff', fontSize: 11, cursor: 'pointer', color: COLORS.muted }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none' }}
          placeholder="Ask about drug info, interactions, dosage…"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <Button onClick={send} disabled={loading || !input.trim()} icon="📤">Send</Button>
      </div>
    </Card>
  );
}

// ── Interactions Tab ──────────────────────────────────────────────────────────
function InteractionsTab() {
  const [drugs, setDrugs] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    const drugList = drugs.split(',').map(d => d.trim()).filter(Boolean);
    if (drugList.length < 2) { toast.error('Enter at least 2 drugs'); return; }
    setLoading(true); setResult(null);
    try { const { data } = await api.post('/ai/interactions', { drugs: drugList }); setResult(data); }
    catch (err) { toast.error(err.error || 'Check failed'); }
    finally { setLoading(false); }
  };

  const SEV_COLORS = { mild: 'green', moderate: 'yellow', severe: 'red', contraindicated: 'red' };
  const RISK_BG    = { safe: '#f0fdf4', caution: '#fffbeb', avoid: '#fff1f2' };
  const RISK_ICONS = { safe: '✅', caution: '⚠️', avoid: '🚫' };

  return (
    <Card>
      <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>Enter drug names separated by commas to check for interactions</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none' }}
          placeholder="e.g. Warfarin, Aspirin, Ibuprofen"
          value={drugs} onChange={e => setDrugs(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} />
        <Button onClick={check} loading={loading} icon="⚗️">Check Interactions</Button>
      </div>

      {result && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: RISK_BG[result.overallRisk] || '#f8fafb', marginBottom: 18 }}>
            <span style={{ fontSize: 24 }}>{RISK_ICONS[result.overallRisk]}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Overall Risk: <span style={{ textTransform: 'uppercase', color: result.overallRisk === 'safe' ? COLORS.success : COLORS.danger }}>{result.overallRisk}</span></div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{result.summary}</div>
            </div>
          </div>
          {result.interactions?.map((int, i) => (
            <div key={i} style={{ padding: 16, border: `1px solid ${COLORS.border}`, borderRadius: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ fontSize: 14 }}>{int.drug1} + {int.drug2}</strong>
                <Badge color={SEV_COLORS[int.severity] || 'gray'}>{int.severity}</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, fontSize: 12 }}>
                <div><span style={{ color: COLORS.muted, fontWeight: 500 }}>Mechanism: </span>{int.mechanism}</div>
                <div><span style={{ color: COLORS.muted, fontWeight: 500 }}>Clinical Effect: </span>{int.clinicalEffect}</div>
                <div style={{ color: COLORS.success }}><span style={{ fontWeight: 500 }}>✅ Recommendation: </span>{int.recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Forecast Tab ──────────────────────────────────────────────────────────────
function ForecastTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setData(null);
    try { const { data: d } = await api.post('/ai/forecast'); setData(d); }
    catch (err) { toast.error(err.error || 'Forecast failed'); }
    finally { setLoading(false); }
  };

  const URG_COLORS = { critical: 'red', high: 'yellow', medium: 'blue', low: 'green' };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>AI-powered 30-day demand forecast based on 90 days of sales history</p>
        <Button onClick={run} loading={loading} icon="🔮">Run AI Forecast</Button>
      </div>

      {data && (
        <div>
          {data.insights?.length > 0 && (
            <div style={{ padding: 16, background: '#eff6ff', borderRadius: 12, marginBottom: 18, border: `1px solid #bfdbfe` }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#1d4ed8' }}>💡 AI Insights</div>
              {data.insights.map((ins, i) => <div key={i} style={{ fontSize: 13, color: '#1e40af', marginBottom: 4 }}>• {ins}</div>)}
            </div>
          )}

          {data.criticalItems?.length > 0 && (
            <div style={{ padding: 12, background: '#fee2e2', borderRadius: 10, marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 12, color: COLORS.danger }}>🚨 Critical: </span>
              <span style={{ fontSize: 12, color: COLORS.danger }}>{data.criticalItems.join(', ')}</span>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Drug', 'Current Stock', 'Predicted (30d)', 'Reorder Qty', 'Urgency', 'Reason'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', background: '#f8fafb', color: COLORS.muted, fontSize: 12, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {data.forecast?.map((f, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f8fafb'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9`, fontWeight: 500 }}>{f.drugName}</td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9` }}>{f.currentStock}</td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9` }}>{f.predictedDemand30Days}</td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9` }}><strong>{f.reorderQty}</strong></td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9` }}><Badge color={URG_COLORS[f.urgency] || 'gray'}>{f.urgency}</Badge></td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9`, fontSize: 12, color: COLORS.muted, maxWidth: 200 }}>{f.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ── OCR Tab ───────────────────────────────────────────────────────────────────
function OcrTab() {
  const [imageB64, setImageB64] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setImageB64(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  };

  const extract = async () => {
    if (!imageB64) return;
    setLoading(true); setResult(null);
    try { const { data } = await api.post('/ai/extract-prescription', { imageBase64: imageB64 }); setResult(data); }
    catch (err) { toast.error(err.error || 'Extraction failed'); }
    finally { setLoading(false); }
  };

  return (
    <Card>
      <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>Upload a handwritten or printed prescription — Claude AI will extract all data automatically</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Upload zone */}
        <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 14, padding: 28, textAlign: 'center', background: '#fafafa', cursor: 'pointer' }}
          onClick={() => document.getElementById('rxFile').click()}>
          {preview ? <img src={preview} alt="preview" style={{ maxHeight: 180, borderRadius: 10, maxWidth: '100%' }} />
            : <><div style={{ fontSize: 36, marginBottom: 10 }}>📷</div><p style={{ fontSize: 13, color: COLORS.muted }}>Click to upload prescription image</p><p style={{ fontSize: 11, color: COLORS.muted }}>JPG, PNG supported</p></>}
          <input id="rxFile" type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <div style={{ padding: 16, background: COLORS.primaryLight, borderRadius: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🔬 What gets extracted:</div>
            {['Doctor name, qualification & license', 'Patient name, age & gender', 'All drug names & dosages', 'Frequency, duration & quantity', 'Special instructions'].map(t => (
              <div key={t} style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>✓ {t}</div>
            ))}
          </div>
          <Button onClick={extract} disabled={!imageB64 || loading} loading={loading} icon="🔍" style={{ justifyContent: 'center', padding: '12px' }}>
            Extract Prescription Data
          </Button>
          {imageB64 && !loading && <p style={{ fontSize: 12, textAlign: 'center', color: COLORS.success }}>✓ Image ready</p>}
        </div>
      </div>

      {/* Results */}
      {result?.data && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            ✅ Extraction Complete
            <Badge color="green">{Math.round((result.data.confidence || 0) * 100)}% confidence</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            {/* Doctor */}
            <div style={{ padding: 14, background: '#f8fafb', borderRadius: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>👨‍⚕️ Doctor</div>
              {Object.entries(result.data.doctor || {}).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: COLORS.muted, textTransform: 'capitalize' }}>{k}: </span><strong>{v}</strong>
                </div>
              ))}
            </div>
            {/* Patient */}
            <div style={{ padding: 14, background: '#f8fafb', borderRadius: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>👤 Patient</div>
              {Object.entries(result.data.patient || {}).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: COLORS.muted, textTransform: 'capitalize' }}>{k}: </span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>💊 Extracted Medications ({result.data.items?.length || 0})</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Drug Name', 'Dosage', 'Frequency', 'Duration', 'Qty', 'Instructions'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', background: '#f8fafb', color: COLORS.muted, fontSize: 12, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {result.data.items?.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: '9px 12px', borderBottom: `1px solid #f1f5f9`, fontWeight: 500 }}>{item.drugName}</td>
                  <td style={{ padding: '9px 12px', borderBottom: `1px solid #f1f5f9` }}>{item.dosage || '—'}</td>
                  <td style={{ padding: '9px 12px', borderBottom: `1px solid #f1f5f9` }}>{item.frequency || '—'}</td>
                  <td style={{ padding: '9px 12px', borderBottom: `1px solid #f1f5f9` }}>{item.duration || '—'}</td>
                  <td style={{ padding: '9px 12px', borderBottom: `1px solid #f1f5f9` }}>{item.quantity || '—'}</td>
                  <td style={{ padding: '9px 12px', borderBottom: `1px solid #f1f5f9`, fontSize: 11, color: COLORS.muted }}>{item.instructions || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
