import React, { useState } from 'react';
import { Card, Badge, Button, Input, Select, Modal, Table, Pagination, SearchBar, PageHeader } from '../components/UI';
import { COLORS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { usePaginatedList } from '../hooks/useFetch';
import api from '../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  firstName: '', lastName: '', phone: '', email: '',
  gender: 'male', dateOfBirth: '', bloodGroup: '',
  allergies: '', chronicConditions: '',
  street: '', city: '', state: '', pincode: '',
  emergencyName: '', emergencyPhone: '', emergencyRelation: '',
  notes: '',
};

export default function Patients() {
  const { items: patients, total, pages, page, setPage, search, setSearch, loading, refetch } = usePaginatedList('/patients');
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditPatient(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      ...EMPTY_FORM, ...p,
      dateOfBirth: p.dateOfBirth?.slice(0, 10) || '',
      allergies: p.allergies?.join(', ') || '',
      chronicConditions: p.chronicConditions?.join(', ') || '',
      street: p.address?.street || '', city: p.address?.city || '',
      state: p.address?.state || '', pincode: p.address?.pincode || '',
      emergencyName: p.emergencyContact?.name || '',
      emergencyPhone: p.emergencyContact?.phone || '',
      emergencyRelation: p.emergencyContact?.relation || '',
    });
    setEditPatient(p); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      firstName: form.firstName, lastName: form.lastName,
      phone: form.phone, email: form.email,
      gender: form.gender, dateOfBirth: form.dateOfBirth, bloodGroup: form.bloodGroup,
      allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: form.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
      address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone, relation: form.emergencyRelation },
      notes: form.notes,
    };
    try {
      if (editPatient) { await api.put(`/patients/${editPatient._id}`, payload); toast.success('Patient updated!'); }
      else { await api.post('/patients', payload); toast.success('Patient registered!'); }
      setShowForm(false); refetch();
    } catch (err) { toast.error(err.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'patientId', label: 'ID', render: v => <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{v}</code> },
    { key: 'firstName', label: 'Name', render: (v, row) => <div><strong>{row.firstName} {row.lastName}</strong></div> },
    { key: 'phone',     label: 'Phone' },
    { key: 'gender',    label: 'Gender', render: v => <Badge color={v === 'male' ? 'blue' : v === 'female' ? 'purple' : 'gray'}>{v}</Badge> },
    { key: 'dateOfBirth', label: 'Age', render: v => v ? `${new Date().getFullYear() - new Date(v).getFullYear()} yrs` : '—' },
    { key: 'allergies', label: 'Allergies', render: v => v?.length ? <Badge color="red">{v.slice(0,2).join(', ')}{v.length > 2 ? ` +${v.length-2}` : ''}</Badge> : '—' },
    { key: 'chronicConditions', label: 'Conditions', render: v => v?.length ? v.slice(0,2).join(', ') : '—' },
    { key: 'createdAt', label: 'Registered', render: v => formatDate(v) },
    { key: '_id', label: 'Actions', render: (id, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="ghost" onClick={() => setViewPatient(row)}>👁️ View</Button>
        <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>✏️</Button>
      </div>
    )},
  ];

  const Field = ({ label, field, type = 'text', required }) => (
    <Input label={label} type={type} value={form[field] ?? ''} required={required}
      onChange={e => set(field, e.target.value)} />
  );

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${total} registered patients`}
        actions={<>
          <SearchBar value={search} onChange={setSearch} placeholder="Search patients…" />
          <Button icon="➕" onClick={openAdd}>Register Patient</Button>
        </>}
      />

      <Card>
        <Table columns={columns} data={patients} loading={loading} emptyMsg="No patients found. Register your first patient!" />
        <Pagination page={page} pages={pages} total={total} onPage={setPage} />
      </Card>

      {/* Add / Edit Modal */}
      {showForm && (
        <Modal title={editPatient ? 'Edit Patient' : 'Register New Patient'} onClose={() => setShowForm(false)} width={680}>
          <form onSubmit={handleSave}>
            {/* Section: Personal */}
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Personal Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <Field label="First Name *" field="firstName" required />
              <Field label="Last Name *"  field="lastName"  required />
              <Field label="Phone *"      field="phone"     required />
              <Field label="Email"        field="email" type="email" />
              <Select label="Gender" value={form.gender} onChange={e => set('gender', e.target.value)}
                options={[{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} />
              <Field label="Date of Birth" field="dateOfBirth" type="date" />
              <Input label="Blood Group" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} placeholder="A+, B-, O+…" />
            </div>

            {/* Section: Medical */}
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Medical Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <Input label="Allergies (comma-separated)" value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="Penicillin, Sulfa, Aspirin" />
              <Input label="Chronic Conditions (comma-separated)" value={form.chronicConditions} onChange={e => set('chronicConditions', e.target.value)} placeholder="Diabetes, Hypertension" />
            </div>

            {/* Section: Address */}
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Address</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <Input label="Street" value={form.street} onChange={e => set('street', e.target.value)} />
              <Input label="City"   value={form.city}   onChange={e => set('city', e.target.value)} />
              <Input label="State"  value={form.state}  onChange={e => set('state', e.target.value)} />
              <Input label="Pincode" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
            </div>

            {/* Section: Emergency Contact */}
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Emergency Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              <Input label="Name"     value={form.emergencyName}     onChange={e => set('emergencyName', e.target.value)} />
              <Input label="Phone"    value={form.emergencyPhone}    onChange={e => set('emergencyPhone', e.target.value)} />
              <Input label="Relation" value={form.emergencyRelation} onChange={e => set('emergencyRelation', e.target.value)} placeholder="Father, Spouse…" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editPatient ? 'Update Patient' : 'Register Patient'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Patient Modal */}
      {viewPatient && (
        <Modal title="Patient Details" onClose={() => setViewPatient(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', background: COLORS.primaryLight, borderRadius: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                {viewPatient.firstName[0]}{viewPatient.lastName[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{viewPatient.firstName} {viewPatient.lastName}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{viewPatient.patientId} · {viewPatient.phone}</div>
              </div>
            </div>
            {[
              ['Gender', viewPatient.gender], ['Blood Group', viewPatient.bloodGroup],
              ['Date of Birth', formatDate(viewPatient.dateOfBirth)],
              ['Email', viewPatient.email],
              ['Allergies', viewPatient.allergies?.join(', ') || 'None'],
              ['Conditions', viewPatient.chronicConditions?.join(', ') || 'None'],
              ['Registered', formatDate(viewPatient.createdAt)],
            ].map(([k, v]) => v && (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
                <span style={{ color: COLORS.muted }}>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
