import React from 'react';
import { Card, Badge, PageHeader, StatCard } from '../components/UI';
import { COLORS } from '../utils/constants';
import { formatDate, getDaysToExpiry } from '../utils/helpers';
import { useFetch } from '../hooks/useFetch';

export default function Inventory() {
  const { data: alerts, loading } = useFetch('/inventory/alerts');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: COLORS.muted }}>Loading alerts…</div>;

  return (
    <div>
      <PageHeader title="Inventory Alerts" subtitle="Real-time stock and expiry monitoring" />

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Low Stock Items"   value={alerts?.lowStock?.length || 0}  icon="📉" bg="#fef9c3" sub="Below minimum level" />
        <StatCard label="Expiring (30 days)" value={alerts?.expiring?.length || 0} icon="📅" bg="#fff7ed" sub="Needs attention soon" />
        <StatCard label="Expired Drugs"     value={alerts?.expired?.length || 0}   icon="🚫" bg="#fee2e2" sub="Remove from shelf immediately" />
      </div>

      {/* Low Stock */}
      <Card title="⚠️ Low Stock Drugs" style={{ marginBottom: 20 }}>
        {!alerts?.lowStock?.length ? (
          <div style={{ padding: 24, textAlign: 'center', color: COLORS.success, fontSize: 14 }}>✅ All drugs are adequately stocked!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Drug Name', 'Category', 'Current Stock', 'Min Level', 'Deficit'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', background: '#fef9c3', color: '#92400e', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #fde68a' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {alerts.lowStock.map(d => (
                <tr key={d._id} onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}><Badge color="blue">{d.category}</Badge></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}><Badge color="red">{d.quantity}</Badge></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: COLORS.muted }}>{d.minStockLevel}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: COLORS.danger, fontWeight: 600 }}>-{d.minStockLevel - d.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Expiring Soon */}
      <Card title="📅 Expiring Within 30 Days" style={{ marginBottom: 20 }}>
        {!alerts?.expiring?.length ? (
          <div style={{ padding: 24, textAlign: 'center', color: COLORS.success, fontSize: 14 }}>✅ No drugs expiring within 30 days!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Drug Name', 'Quantity', 'Expiry Date', 'Days Left'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', background: '#fff7ed', color: '#92400e', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #fed7aa' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {alerts.expiring.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)).map(d => {
                const days = getDaysToExpiry(d.expiryDate);
                return (
                  <tr key={d._id} onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 500 }}>{d.name}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>{d.quantity}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>{formatDate(d.expiryDate)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      <Badge color={days <= 7 ? 'red' : 'yellow'}>{days} days</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Expired */}
      <Card title="🚫 Expired Drugs — Remove Immediately">
        {!alerts?.expired?.length ? (
          <div style={{ padding: 24, textAlign: 'center', color: COLORS.success, fontSize: 14 }}>✅ No expired drugs on shelf!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Drug Name', 'Quantity', 'Expired On', 'Days Expired'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #fecaca' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {alerts.expired.map(d => {
                const days = Math.abs(getDaysToExpiry(d.expiryDate));
                return (
                  <tr key={d._id} style={{ background: '#fff5f5' }}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #fee2e2', fontWeight: 500, color: COLORS.danger }}>{d.name}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #fee2e2' }}>{d.quantity}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #fee2e2' }}>{formatDate(d.expiryDate)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #fee2e2' }}><Badge color="red">{days} days ago</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
