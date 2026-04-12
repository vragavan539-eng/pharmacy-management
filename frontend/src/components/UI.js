import React from 'react';
import { COLORS, BADGE_COLORS } from '../utils/constants';

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ color = 'gray', children, size = 'sm' }) => {
  const c = BADGE_COLORS[color] || BADGE_COLORS.gray;
  return (
    <span style={{
      display: 'inline-block',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 13,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({ variant = 'primary', size = 'md', children, icon, loading, style = {}, ...props }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 8, border: 'none', cursor: props.disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, transition: 'all 0.15s', opacity: props.disabled ? 0.6 : 1,
    fontSize: size === 'sm' ? 12 : 13,
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '11px 22px' : '8px 16px',
  };
  const variants = {
    primary: { background: COLORS.primary, color: '#fff' },
    danger:  { background: COLORS.danger, color: '#fff' },
    success: { background: COLORS.success, color: '#fff' },
    ghost:   { background: 'transparent', color: COLORS.muted, border: `1px solid ${COLORS.border}` },
    outline: { background: 'transparent', color: COLORS.primary, border: `1px solid ${COLORS.primary}` },
    white:   { background: '#fff', color: COLORS.text, border: `1px solid ${COLORS.border}` },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
      {loading ? 'Loading…' : children}
    </button>
  );
};

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, style = {}, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}>{label}</label>}
    <input style={{
      padding: '9px 12px', borderRadius: 8,
      border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
      fontSize: 13, outline: 'none', background: '#fff',
      width: '100%', boxSizing: 'border-box', ...style,
    }} {...props} />
    {error && <span style={{ fontSize: 11, color: COLORS.danger }}>{error}</span>}
  </div>
);

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = ({ label, options = [], style = {}, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}>{label}</label>}
    <select style={{
      padding: '9px 12px', borderRadius: 8,
      border: `1px solid ${COLORS.border}`,
      fontSize: 13, outline: 'none', background: '#fff',
      width: '100%', boxSizing: 'border-box', ...style,
    }} {...props}>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ title, children, action, style = {} }) => (
  <div style={{
    background: '#fff', borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    padding: 20, ...style,
  }}>
    {title && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, margin: 0 }}>{title}</h3>
        {action}
      </div>
    )}
    {children}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, sub, bg = '#fff' }) => (
  <div style={{
    background: bg, borderRadius: 12, padding: '16px 20px',
    border: `1px solid ${COLORS.border}`,
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.text }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: COLORS.muted }}>{sub}</div>}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, width = 580 }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  }}>
    <div style={{
      background: '#fff', borderRadius: 16, width: '100%', maxWidth: width,
      maxHeight: '90vh', overflow: 'auto',
      boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky', top: 0, background: '#fff', zIndex: 1,
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: COLORS.muted, padding: 4 }}>✕</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

// ── Table ─────────────────────────────────────────────────────────────────────
export const Table = ({ columns, data, loading, emptyMsg = 'No data found' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} style={{
              padding: '10px 14px', textAlign: col.align || 'left',
              background: '#f8fafb', color: COLORS.muted, fontWeight: 500,
              fontSize: 12, borderBottom: `1px solid ${COLORS.border}`,
              whiteSpace: 'nowrap',
            }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={columns.length} style={{ padding: 30, textAlign: 'center', color: COLORS.muted }}>Loading…</td></tr>
        ) : data.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ padding: 30, textAlign: 'center', color: COLORS.muted }}>{emptyMsg}</td></tr>
        ) : data.map((row, i) => (
          <tr key={row._id || i} style={{ transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafb'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            {columns.map(col => (
              <td key={col.key} style={{
                padding: '11px 14px', borderBottom: `1px solid #f1f5f9`,
                color: COLORS.text, textAlign: col.align || 'left',
              }}>
                {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Pagination ────────────────────────────────────────────────────────────────
export const Pagination = ({ page, pages, total, limit = 15, onPage }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 4px 0', borderTop: `1px solid ${COLORS.border}`, marginTop: 8 }}>
      <span style={{ fontSize: 12, color: COLORS.muted }}>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => onPage(page - 1)}>← Prev</Button>
        <span style={{ padding: '6px 12px', fontSize: 12, color: COLORS.muted }}>Page {page} / {pages}</span>
        <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</Button>
      </div>
    </div>
  );
};

// ── Search Bar ────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = 'Search…', width = 220 }) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.4 }}>🔍</span>
    <input
      style={{
        padding: '8px 12px 8px 32px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
        fontSize: 13, outline: 'none', background: '#fff', width,
      }}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// ── Page Header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
    <div>
      <h2 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: COLORS.text }}>{title}</h2>
      {subtitle && <p style={{ color: COLORS.muted, fontSize: 13, margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, desc }) => (
  <div style={{ textAlign: 'center', padding: '48px 20px', color: COLORS.muted }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.text, marginBottom: 6 }}>{title}</div>
    {desc && <div style={{ fontSize: 13 }}>{desc}</div>}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 24 }) => (
  <div style={{
    width: size, height: size, border: `3px solid ${COLORS.border}`,
    borderTop: `3px solid ${COLORS.primary}`, borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }} />
);
