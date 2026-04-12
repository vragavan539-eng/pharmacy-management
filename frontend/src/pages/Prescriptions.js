import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Modal, Table, Pagination, SearchBar, PageHeader } from '../components/UI';
import { COLORS } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/helpers';
import { usePaginatedList } from '../hooks/useFetch';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending: 'yellow', verified: 'blue', dispensed: 'green', partial: 'purple', cancelled: 'red' };

export default function Prescriptions() {
  const { items: prescriptions, total, pages, page, setPage, search, setSearch, loading, refetch } = usePaginatedList('/prescriptions');
  const [showForm, setShowForm] = useState(false);
  const [viewRx, setViewRx] = useState(null);
  const [patients, setPatients] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patient: '', doctorName: '', doctorQualification: '', doctorLicense: '', doctorHospital: '', doctorPhone: '',
    prescriptionDate: new Date().toISOString().slice(0, 10), notes: '',
    items: [{ drug: '', quantity: 1, dosage: '', frequency: '', duration: '', instructions: '' }],
  });

  useEffect(() => {
    api.get('/patients?limit=200').then(r => setPatients(r.data.patients || []));
    api.get('/drugs?limit=500').then(r => setDrugs(r.data.drugs || []));
  }, []);

  const setItem = (i, k, v) => setForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [k]: v };
    return { ...f, items };
  });

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { drug: '', quantity: 1, dosage: '', frequency: '', duration: '', instructions: '' }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      patient: form.patient,
      doctor: { name: form.doctorName, qualification: form.doctorQualification, license: form.doctorLicense, hospital: form.doctorHospital, phone: form.doctorPhone },
      prescriptionDate: form.prescriptionDate, notes: form.notes,
      items: form.items.filter(i => i.drug),
    };
    try { await api.post('/prescriptions', payload); toast.success('Prescription created!'); setShowForm(false); refetch(); }
    catch (err) { toast.error(err.error || 'Failed to create'); }
    finally { setSaving(false); }
  };

  const handleDispense = async (id) => {
    if (!window.confirm('Dispense this prescription? Stock will be deducted.')) return;
    try { await api.patch(`/prescriptions/${id}/dispense`); toast.success('Dispensed!'); refetch(); }
    catch (err) { toast.error(err.error || 'Failed to dispense'); }
  };

  const columns = [
    { key: 'prescriptionId', label: 'Rx ID', render: v => <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{v}</code> },
    { key: 'patient', label: 'Patient', render: (v) => v ? <div><strong>{v.firstName} {v.lastName}</strong><div style={{ fontSize: 11, color: COLORS.muted }}>{v.patientId}</div></div> : '—' },
    { key: 'doctor',  label: 'Doctor',  render: v => v?.name || '—' },
    { key: 'items',   label: 'Drugs',   render: v => `${v?.length || 0} item(s)` },
    { key: 'totalAmount', label: 'Total', render: v => formatCurrency(v) },
    { key: 'status',  label: 'Status',  render: v => <Badge color={STATUS_COLORS[v] || 'gray'}>{v}</Badge> },
    { key: 'prescriptionDate', label: 'Date', render: v => formatDate(v) },
    { key: '_id', label: 'Actions', render: (id, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="ghost" onClick={() => setViewRx(row)}>👁️ View</Button>
        {row.status === 'pending' && <Button size="sm" variant="success" style={{ fontSize: 11 }} onClick={() => handleDispense(id)}>✅ Dispense</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        subtitle={`${total} total prescriptions`}
        actions={<>
          <SearchBar value={search} onChange={setSearch} placeholder="Search…" />
          <Button icon="➕" onClick={() => setShowForm(true)}>New Prescription</Button>
        </>}
      />

      <Card>
        <Table columns={columns} data={prescriptions} loading={loading} emptyMsg="No prescriptions yet." />
        <Pagination page={page} pages={pages} total={total} onPage={setPage} />
      </Card>

      {/* New Prescription Modal */}
      {showForm && (
        <Modal title="New Prescription" onClose={() => setShowForm(false)} width={720}>
          <form onSubmit={handleSave}>
            <SectionLabel>Patient & Doctor</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Patient *</label>
                <select required style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
                  value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}>
                  <option value="">— Select Patient —</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
                </select>
              </div>
              <Input label="Prescription Date" type="date" value={form.prescriptionDate} onChange={e => setForm(f => ({ ...f, prescriptionDate: e.target.value }))} />
              <Input label="Doctor Name"          value={form.doctorName}          onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} />
              <Input label="Qualification"        value={form.doctorQualification} onChange={e => setForm(f => ({ ...f, doctorQualification: e.target.value }))} placeholder="MBBS, MD…" />
              <Input label="License Number"       value={form.doctorLicense}       onChange={e => setForm(f => ({ ...f, doctorLicense: e.target.value }))} />
              <Input label="Hospital / Clinic"    value={form.doctorHospital}      onChange={e => setForm(f => ({ ...f, doctorHospital: e.target.value }))} />
            </div>

            <SectionLabel>Medications</SectionLabel>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Drug *</label>
                  <select style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
                    value={item.drug} onChange={e => setItem(i, 'drug', e.target.value)}>
                    <option value="">— Select Drug —</option>
                    {drugs.map(d => <option key={d._id} value={d._id}>{d.name} ({d.strength})</option>)}
                  </select>
                </div>
                <Input label="Qty" type="number" min={1} value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
                <Input label="Dosage"    value={item.dosage}    onChange={e => setItem(i, 'dosage', e.target.value)}    placeholder="500mg" />
                <Input label="Frequency" value={item.frequency} onChange={e => setItem(i, 'frequency', e.target.value)} placeholder="TDS" />
                <Input label="Duration"  value={item.duration}  onChange={e => setItem(i, 'duration', e.target.value)}  placeholder="5 days" />
                <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.danger, fontSize: 18, paddingBottom: 4 }}>✕</button>
              </div>
            ))}
            <Button variant="ghost" type="button" icon="➕" size="sm" onClick={addItem} style={{ marginBottom: 18 }}>Add Drug</Button>

            <Input label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional instructions…" />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Create Prescription</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Prescription Modal */}
      {viewRx && (
        <Modal title={`Prescription — ${viewRx.prescriptionId}`} onClose={() => setViewRx(null)} width={540}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InfoRow label="Patient" value={`${viewRx.patient?.firstName} ${viewRx.patient?.lastName}`} />
              <InfoRow label="Date" value={formatDate(viewRx.prescriptionDate)} />
              <InfoRow label="Doctor" value={viewRx.doctor?.name} />
              <InfoRow label="Status" value={<Badge color={STATUS_COLORS[viewRx.status]}>{viewRx.status}</Badge>} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>Medications</div>
            {viewRx.items?.map((item, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#f8fafb', borderRadius: 10, fontSize: 13 }}>
                <strong>{item.drugName}</strong>
                <div style={{ color: COLORS.muted, marginTop: 4 }}>
                  {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ')} — Qty: {item.quantity}
                </div>
                {item.instructions && <div style={{ color: COLORS.muted, fontSize: 12 }}>{item.instructions}</div>}
              </div>
            ))}
            <InfoRow label="Total Amount" value={<strong>{formatCurrency(viewRx.totalAmount)}</strong>} />
            {viewRx.notes && <InfoRow label="Notes" value={viewRx.notes} />}
          </div>
        </Modal>
      )}
    </div>
  );
}

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ fontSize: 13 }}>
    <span style={{ color: COLORS.muted, display: 'block', fontSize: 11, marginBottom: 2 }}>{label}</span>
    <span>{value || '—'}</span>
  </div>
);
