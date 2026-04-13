import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PRIMARY = '#1a6b4a';
const BORDER  = '#d1e8dd';
const MUTED   = '#6b7c74';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cards = [
    { label: 'Drug Inventory',   icon: '💊', path: '/app/drugs',         desc: 'Manage all drugs & stock',    color: '#f0fdf4' },
    { label: 'Patients',         icon: '👥', path: '/app/patients',       desc: 'Patient records & history',   color: '#eff6ff' },
    { label: 'Prescriptions',    icon: '📋', path: '/app/prescriptions',  desc: 'Create & dispense Rx',        color: '#fdf4ff' },
    { label: 'Billing',          icon: '💰', path: '/app/billing',        desc: 'Generate & track bills',      color: '#fff7ed' },
    { label: 'Inventory Alerts', icon: '⚠️', path: '/app/inventory',      desc: 'Low stock & expiry alerts',   color: '#fef9c3' },
    { label: 'AI Features',      icon: '🤖', path: '/app/ai',             desc: 'Smart AI tools for pharmacy', color: '#f0f7ff' },
    { label: 'Dashboard',        icon: '📊', path: '/app/dashboard',      desc: 'Analytics & revenue trends',  color: '#f0fdf4' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #2d8a60 100%)`,
        borderRadius: 16, padding: isMobile ? '20px 20px' : '28px 32px',
        marginBottom: 24, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, margin: 0 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: isMobile ? 12 : 14 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ fontSize: isMobile ? 36 : 56 }}>💊</div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 10 : 14,
          marginBottom: 24,
        }}>
          {[
            { label: "Today's Revenue", value: `₹${stats.todayRevenue?.toLocaleString('en-IN') || 0}`, icon: '💰', bg: '#f0fdf4' },
            { label: 'Total Drugs',     value: stats.totalDrugs || 0,    icon: '💊', bg: '#eff6ff' },
            { label: 'Patients',        value: stats.totalPatients || 0, icon: '👥', bg: '#fdf4ff' },
            { label: 'Pending Rx',      value: stats.pendingRx || 0,     icon: '📋', bg: '#fff7ed' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 12, padding: isMobile ? '12px 14px' : '16px 18px', border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: isMobile ? 11 : 12, color: MUTED, fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: isMobile ? 16 : 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Access Cards */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: '#1a2e23' }}>Quick Access</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 14,
      }}>
        {cards.map(c => (
          <div
            key={c.path}
            onClick={() => navigate(c.path)}
            style={{
              background: c.color, borderRadius: 14,
              padding: isMobile ? '16px 14px' : '20px 18px',
              border: `1px solid ${BORDER}`, cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ fontSize: isMobile ? 24 : 30, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14, marginBottom: 4 }}>{c.label}</div>
            {!isMobile && <div style={{ fontSize: 12, color: MUTED }}>{c.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}