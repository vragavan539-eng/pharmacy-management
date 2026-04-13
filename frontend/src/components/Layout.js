import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/app',               label: 'Home',          icon: '🏠' },
  { path: '/app/dashboard',     label: 'Dashboard',     icon: '📊' },
  { path: '/app/drugs',         label: 'Drugs',         icon: '💊' },
  { path: '/app/patients',      label: 'Patients',      icon: '👥' },
  { path: '/app/prescriptions', label: 'Prescriptions', icon: '📋' },
  { path: '/app/billing',       label: 'Billing',       icon: '💰' },
  { path: '/app/inventory',     label: 'Inventory',     icon: '⚠️' },
  { path: '/app/ai',            label: 'AI Features',   icon: '🤖' },
];

const PRIMARY = '#1a6b4a';
const DARK    = '#0d4a32';
const ACCENT  = '#f59e0b';
const BORDER  = '#d1e8dd';
const MUTED   = '#6b7c74';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = window.innerWidth <= 768;

  const sidebarWidth = collapsed ? 64 : 230;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f7f4' }}>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        background: DARK,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 100, transition: 'transform 0.25s, width 0.2s',
        transform: isMobile
          ? mobileOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
      }}>
        {/* Logo */}
        <div
          onClick={() => { if (!isMobile) setCollapsed(c => !c); }}
          style={{
            padding: '18px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: isMobile ? 'default' : 'pointer',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💊</div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>PharmAI</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Pharmacy Suite</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              onClick={() => isMobile && setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: isActive ? `3px solid ${ACCENT}` : '3px solid transparent',
                fontSize: 13.5, fontWeight: isActive ? 500 : 400,
                textDecoration: 'none', transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{user?.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '7px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', fontSize: 13,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <span>🚪</span>{!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : sidebarWidth,
        display: 'flex', flexDirection: 'column',
        transition: 'margin-left 0.2s',
      }}>
        {/* Header */}
        <header style={{
          background: '#fff',
          borderBottom: `1px solid ${BORDER}`,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger - mobile only */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(o => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 22, color: DARK, padding: '0 4px',
                  lineHeight: 1,
                }}
              >
                ☰
              </button>
            )}
            <span style={{ fontSize: 13, color: MUTED }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            System Online
          </div>
        </header>

        <main style={{ flex: 1, padding: isMobile ? 14 : 26 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}