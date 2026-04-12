import React, { useEffect, useState } from 'react';
import { StatCard, Card, Badge, PageHeader } from '../components/UI';
import { COLORS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/helpers';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/inventory/alerts'),
    ]).then(([s, a]) => {
      setStats(s.data);
      setAlerts(a.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: COLORS.muted }}>Loading dashboard…</div>;

  const maxRevenue = Math.max(...(stats?.trend?.map(t => t.revenue) || [1]), 1);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Today's Revenue"   value={formatCurrency(stats?.todayRevenue)}   icon="💰" sub={`${stats?.todayBillCount || 0} bills today`}  bg="#f0fdf4" />
        <StatCard label="Monthly Revenue"   value={formatCurrency(stats?.monthRevenue)}   icon="📈" sub="This month"                                      bg="#eff6ff" />
        <StatCard label="Total Drugs"       value={stats?.totalDrugs || 0}               icon="💊" sub={`${stats?.lowStockCount || 0} low stock`}        bg="#fdf4ff" />
        <StatCard label="Patients"          value={stats?.totalPatients || 0}            icon="👥" sub={`${stats?.pendingRx || 0} pending prescriptions`} bg="#fff7ed" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue bar chart */}
        <Card title="7-Day Revenue Trend">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, paddingTop: 8 }}>
            {stats?.trend?.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 9, color: COLORS.muted }}>{formatCurrency(d.revenue).replace('₹','₹')}</span>
                <div style={{
                  width: '100%', background: COLORS.primary, borderRadius: '5px 5px 0 0',
                  height: `${Math.max((d.revenue / maxRevenue) * 90, 4)}px`,
                  minHeight: 4, transition: 'height 0.4s',
                }} />
                <span style={{ fontSize: 10, color: COLORS.muted }}>{d.date?.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Inventory alerts */}
        <Card title="Inventory Alerts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '🟡 Low Stock',     count: alerts?.lowStock?.length,  bg: '#fef9c3', color: 'yellow' },
              { label: '🟠 Expiring Soon', count: alerts?.expiring?.length,  bg: '#fff7ed', color: 'yellow' },
              { label: '🔴 Expired',       count: alerts?.expired?.length,   bg: '#fee2e2', color: 'red' },
            ].map(a => (
              <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: a.bg, borderRadius: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</span>
                <Badge color={a.color}>{a.count || 0} items</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Low Stock Table ── */}
      {alerts?.lowStock?.length > 0 && (
        <Card title="⚠️ Low Stock Drugs">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Drug Name', 'Category', 'Current Qty', 'Min Level', 'Status'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', background: '#f8fafb', color: COLORS.muted, fontSize: 12, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.lowStock.slice(0, 8).map(d => (
                <tr key={d._id}>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9`, fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9` }}><Badge color="blue">{d.category}</Badge></td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9` }}><Badge color="red">{d.quantity}</Badge></td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9`, color: COLORS.muted }}>{d.minStockLevel}</td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid #f1f5f9` }}><Badge color="red">Low Stock</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
