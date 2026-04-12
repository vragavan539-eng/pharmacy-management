import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select, Modal, Table, Pagination, SearchBar, PageHeader } from '../components/UI';
import { COLORS, PAYMENT_METHODS } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/helpers';
import { usePaginatedList } from '../hooks/useFetch';
import api from '../services/api';
import toast from 'react-hot-toast';

const PAYMENT_COLORS = { cash: 'green', card: 'blue', upi: 'purple', insurance: 'yellow', credit: 'red' };
const STATUS_COLORS  = { paid: 'green', pending: 'yellow', partial: 'blue', refunded: 'red' };

export default function Billing() {
  const { items: bills, total, pages, page, setPage, loading, refetch } = usePaginatedList('/billing');
  const [showForm, setShowForm] = useState(false);
  const [viewBill, setViewBill] = useState(null);
  const [patients, setPatients] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patient: '', patientName: '', paymentMethod: 'cash', notes: '',
    items: [{ drug: '', name: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
    discount: 0, amountPaid: 0,
  });

  useEffect(() => {
    api.get('/patients?limit=200').then(r => setPatients(r.data.patients || []));
    api.get('/drugs?limit=500').then(r => setDrugs(r.data.drugs || []));
  }, []);

  const setItem = (i, k, v) => setForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [k]: v };
    if (k === 'drug') {
      const d = drugs.find(d => d._id === v);
      if (d) { items[i].name = d.name; items[i].unitPrice = d.sellingPrice; }
    }
    items[i].totalPrice = (items[i].unitPrice * items[i].quantity) - (items[i].discount || 0);
    return { ...f, items };
  });

  const subtotal = form.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const total_amt = subtotal - (form.discount || 0);
  const change = (form.amountPaid || 0) - total_amt;

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      patient: form.patient || undefined, patientName: form.patientName,
      paymentMethod: form.paymentMethod, notes: form.notes,
      items: form.items.filter(i => i.drug || i.name).map(i => ({ ...i, totalPrice: i.unitPrice * i.quantity - (i.discount || 0) })),
      subtotal, discount: form.discount || 0, tax: 0,
      total: total_amt, amountPaid: form.amountPaid, change: Math.max(change, 0),
      paymentStatus: 'paid',
    };
    try { await api.post('/billing', payload); toast.success('Bill created!'); setShowForm(false); refetch(); }
    catch (err) { toast.error(err.error || 'Failed to create bill'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'billNumber', label: 'Bill #', render: v => <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{v}</code> },
    { key: 'patient', label: 'Patient', render: (v, row) => row.patientName || (v ? `${v.firstName} ${v.lastName}` : 'Walk-in') },
    { key: 'items',   label: 'Items',   render: v => `${v?.length || 0}` },
    { key: 'subtotal',label: 'Subtotal',render: v => formatCurrency(v) },
    { key: 'discount',label: 'Discount',render: v => v ? formatCurrency(v) : '—' },
    { key: 'total',   label: 'Total',   render: v => <strong>{formatCurrency(v)}</strong> },
    { key: 'paymentMethod', label: 'Payment', render: v => <Badge color={PAYMENT_COLORS[v] || 'gray'}>{v?.toUpperCase()}</Badge> },
    { key: 'paymentStatus', label: 'Status',  render: v => <Badge color={STATUS_COLORS[v]  || 'gray'}>{v}</Badge> },
    { key: 'createdAt', label: 'Date', render: v => formatDate(v) },
    { key: '_id', label: '', render: (id, row) => <Button size="sm" variant="ghost" onClick={() => setViewBill(row)}>👁️</Button> },
  ];

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle={`${total} total bills`}
        actions={<Button icon="➕" onClick={() => setShowForm(true)}>New Bill</Button>}
      />

      <Card>
        <Table columns={columns} data={bills} loading={loading} emptyMsg="No bills yet." />
        <Pagination page={page} pages={pages} total={total} onPage={setPage} />
      </Card>

      {/* New Bill Modal */}
      {showForm && (
        <Modal title="Create Bill" onClose={() => setShowForm(false)} width={720}>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Patient (optional)</label>
                <select style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
                  value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}>
                  <option value="">— Walk-in / No Patient —</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
                </select>
              </div>
              <Input label="Patient Name (if walk-in)" value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} placeholder="Walk-in Customer" />
              <Select label="Payment Method" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                options={PAYMENT_METHODS.map(m => ({ value: m, label: m.toUpperCase() }))} />
            </div>

            {/* Items */}
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Items</div>
            <div style={{ background: '#f8fafb', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: 11, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Drug</label>
                    <select style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 12 }}
                      value={item.drug} onChange={e => setItem(i, 'drug', e.target.value)}>
                      <option value="">— Select Drug —</option>
                      {drugs.map(d => <option key={d._id} value={d._id}>{d.name} — ₹{d.sellingPrice}</option>)}
                    </select>
                  </div>
                  <Input label="Qty"         type="number" min={1} value={item.quantity}   onChange={e => setItem(i, 'quantity',   Number(e.target.value))} />
                  <Input label="Price (₹)"   type="number" min={0} value={item.unitPrice}  onChange={e => setItem(i, 'unitPrice',  Number(e.target.value))} />
                  <Input label="Discount (₹)" type="number" min={0} value={item.discount}  onChange={e => setItem(i, 'discount',   Number(e.target.value))} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.danger, fontSize: 18, paddingBottom: 4 }}>✕</button>
                </div>
              ))}
              <Button variant="ghost" type="button" size="sm" icon="➕" onClick={() => setForm(f => ({ ...f, items: [...f.items, { drug: '', name: '', quantity: 1, unitPrice: 0, discount: 0 }] }))}>
                Add Item
              </Button>
            </div>

            {/* Totals */}
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Overall Discount (₹)" type="number" min={0} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))} />
                <Input label="Amount Paid (₹)" type="number" min={0} value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginTop: 12 }}>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Subtotal: {formatCurrency(subtotal)}</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Discount: - {formatCurrency(form.discount || 0)}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>Total: {formatCurrency(total_amt)}</div>
                {form.amountPaid > 0 && <div style={{ fontSize: 14, color: change >= 0 ? COLORS.success : COLORS.danger }}>Change: {formatCurrency(Math.abs(change))} {change < 0 ? '(Due)' : ''}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving} icon="🖨️">Generate Bill</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Bill Modal */}
      {viewBill && (
        <Modal title={`Bill — ${viewBill.billNumber}`} onClose={() => setViewBill(null)} width={480}>
          <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>💊 PharmAI Pharmacy</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>{formatDate(viewBill.createdAt)}</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>Bill: {viewBill.billNumber}</div>
            </div>
            <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '10px 0', marginBottom: 10 }}>
              {viewBill.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatCurrency(viewBill.subtotal)}</span></div>
            {viewBill.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.success }}><span>Discount</span><span>- {formatCurrency(viewBill.discount)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, borderTop: '1px solid #ccc', paddingTop: 8, marginTop: 8 }}><span>TOTAL</span><span>{formatCurrency(viewBill.total)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, color: COLORS.muted }}><span>Paid ({viewBill.paymentMethod})</span><span>{formatCurrency(viewBill.amountPaid)}</span></div>
            {viewBill.change > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Change</span><span>{formatCurrency(viewBill.change)}</span></div>}
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: COLORS.muted }}>Thank you for your visit!</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
