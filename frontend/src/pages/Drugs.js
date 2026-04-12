import React, { useState } from 'react';
import { Card, Badge, Button, Input, Select, Modal, Table, Pagination, SearchBar, PageHeader } from '../components/UI';
import { COLORS, DRUG_CATEGORIES, DOSAGE_FORMS } from '../utils/constants';
import { formatCurrency, formatDate, getDaysToExpiry, getExpiryBadgeColor, getExpiryLabel } from '../utils/helpers';
import { usePaginatedList } from '../hooks/useFetch';
import api from '../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', genericName: '', brand: '', category: 'other', dosageForm: 'tablet',
  strength: '', manufacturer: '', batchNumber: '',
  quantity: 0, minStockLevel: 10, maxStockLevel: 1000,
  unitPrice: 0, sellingPrice: 0,
  expiryDate: '', manufactureDate: '',
  requiresPrescription: false, controlled: false,
  storageConditions: '', description: '', location: '',
};

export default function Drugs() {
  const { items: drugs, total, pages, page, setPage, search, setSearch, loading, refetch } = usePaginatedList('/drugs');
  const [showForm, setShowForm] = useState(false);
  const [editDrug, setEditDrug] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [stockQty, setStockQty] = useState(0);
  const [stockOp, setStockOp] = useState('add');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditDrug(null); setShowForm(true); };
  const openEdit = (d) => { setForm({ ...EMPTY_FORM, ...d, expiryDate: d.expiryDate ? d.expiryDate.slice(0, 10) : '' }); setEditDrug(d); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editDrug) { await api.put(`/drugs/${editDrug._id}`, form); toast.success('Drug updated!'); }
      else { await api.post('/drugs', form); toast.success('Drug added!'); }
      setShowForm(false); refetch();
    } catch (err) { toast.error(err.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this drug?')) return;
    try { await api.delete(`/drugs/${id}`); toast.success('Drug removed'); refetch(); }
    catch (err) { toast.error('Failed to remove'); }
  };

  const handleStock = async () => {
    try {
      await api.patch(`/drugs/${stockModal._id}/stock`, { quantity: Number(stockQty), operation: stockOp });
      toast.success('Stock updated!'); setStockModal(null); refetch();
    } catch (err) { toast.error('Failed to update stock'); }
  };

  const columns = [
    { key: 'name', label: 'Drug Name', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
        {row.genericName && <div style={{ fontSize: 11, color: COLORS.muted }}>{row.genericName}</div>}
        {row.brand && <div style={{ fontSize: 11, color: COLORS.muted }}>{row.brand}</div>}
      </div>
    )},
    { key: 'category',   label: 'Category', render: v => <Badge color="blue">{v}</Badge> },
    { key: 'dosageForm', label: 'Form' },
    { key: 'strength',   label: 'Strength' },
    { key: 'quantity',   label: 'Stock', render: (v, row) => <Badge color={v <= row.minStockLevel ? 'red' : v <= row.minStockLevel * 2 ? 'yellow' : 'green'}>{v}</Badge> },
    { key: 'sellingPrice', label: 'MRP', render: v => formatCurrency(v) },
    { key: 'expiryDate',   label: 'Expiry', render: v => {
      const days = getDaysToExpiry(v);
      return <Badge color={getExpiryBadgeColor(days)}>{getExpiryLabel(days)}</Badge>;
    }},
    { key: 'requiresPrescription', label: 'Type', render: v => <Badge color={v ? 'yellow' : 'green'}>{v ? 'Rx' : 'OTC'}</Badge> },
    { key: '_id', label: 'Actions', render: (id, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="ghost" onClick={() => { setStockModal(row); setStockQty(0); setStockOp('add'); }}>📦 Stock</Button>
        <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>✏️</Button>
        <Button size="sm" variant="ghost" onClick={() => handleDelete(id)} style={{ color: COLORS.danger }}>🗑️</Button>
      </div>
    )},
  ];

  const Field = ({ label, field, type = 'text', required }) => (
    <Input label={label} type={type} value={form[field] ?? ''} required={required}
      onChange={e => set(field, type === 'number' ? Number(e.target.value) : e.target.value)} />
  );

  return (
    <div>
      <PageHeader
        title="Drug Inventory"
        subtitle={`${total} total drugs`}
        actions={<>
          <SearchBar value={search} onChange={setSearch} placeholder="Search drugs…" />
          <Button icon="➕" onClick={openAdd}>Add Drug</Button>
        </>}
      />

      <Card>
        <Table columns={columns} data={drugs} loading={loading} emptyMsg="No drugs found. Add your first drug!" />
        <Pagination page={page} pages={pages} total={total} onPage={setPage} />
      </Card>

      {/* Add / Edit Modal */}
      {showForm && (
        <Modal title={editDrug ? 'Edit Drug' : 'Add New Drug'} onClose={() => setShowForm(false)} width={680}>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Drug Name *"     field="name"        required />
              <Field label="Generic Name"    field="genericName" />
              <Field label="Brand"           field="brand" />
              <Field label="Strength"        field="strength" />
              <Field label="Manufacturer"    field="manufacturer" />
              <Field label="Batch Number"    field="batchNumber" />
              <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}
                options={DRUG_CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
              <Select label="Dosage Form" value={form.dosageForm} onChange={e => set('dosageForm', e.target.value)}
                options={DOSAGE_FORMS.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))} />
              <Field label="Quantity *"       field="quantity"      type="number" required />
              <Field label="Min Stock Level"  field="minStockLevel" type="number" />
              <Field label="Unit Price (₹) *" field="unitPrice"     type="number" required />
              <Field label="Selling Price (₹) *" field="sellingPrice" type="number" required />
              <Input label="Manufacture Date" type="date" value={form.manufactureDate?.slice?.(0, 10) || ''} onChange={e => set('manufactureDate', e.target.value)} />
              <Input label="Expiry Date"      type="date" value={form.expiryDate}                           onChange={e => set('expiryDate', e.target.value)} />
              <Input label="Storage Location / Rack" value={form.location} onChange={e => set('location', e.target.value)} />
              <Input label="Storage Conditions"      value={form.storageConditions} onChange={e => set('storageConditions', e.target.value)} />
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.requiresPrescription} onChange={e => set('requiresPrescription', e.target.checked)} />
                  Requires Prescription (Rx)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.controlled} onChange={e => set('controlled', e.target.checked)} />
                  Controlled Substance
                </label>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted, display: 'block', marginBottom: 6 }}>Description</label>
                <textarea style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, resize: 'vertical', minHeight: 72, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editDrug ? 'Update Drug' : 'Add Drug'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Update Modal */}
      {stockModal && (
        <Modal title={`Update Stock — ${stockModal.name}`} onClose={() => setStockModal(null)} width={380}>
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8fafb', borderRadius: 10, fontSize: 13 }}>
            Current Stock: <strong>{stockModal.quantity}</strong>
          </div>
          <Select label="Operation" value={stockOp} onChange={e => setStockOp(e.target.value)}
            options={[{ value: 'add', label: 'Add Stock' }, { value: 'subtract', label: 'Remove Stock' }, { value: 'set', label: 'Set Exact Quantity' }]} />
          <div style={{ marginTop: 14 }}>
            <Input label="Quantity" type="number" min={0} value={stockQty} onChange={e => setStockQty(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="ghost" onClick={() => setStockModal(null)}>Cancel</Button>
            <Button onClick={handleStock}>Update Stock</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
