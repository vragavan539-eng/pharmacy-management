import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/app');
    } catch (err) {
      setError(err.error || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a2818 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(15px) rotate(-5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .input-field {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
          font-family: 'Segoe UI', sans-serif;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .input-field:focus {
          border-color: rgba(26,107,74,0.7);
          background: rgba(26,107,74,0.08);
          box-shadow: 0 0 0 4px rgba(26,107,74,0.12);
        }
        .sign-in-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #1a6b4a, #2d8a60);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
          box-shadow: 0 6px 24px rgba(26,107,74,0.4);
          font-family: 'Segoe UI', sans-serif;
        }
        .sign-in-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(26,107,74,0.55);
        }
        .sign-in-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .back-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.5); font-size: 13px;
          cursor: pointer; display: flex; align-items: center;
          gap: 6px; padding: 0;
          font-family: 'Segoe UI', sans-serif;
          transition: color 0.2s; margin-bottom: 32px;
        }
        .back-btn:hover { color: rgba(255,255,255,0.9); }
        .demo-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; font-size: 12px;
          color: rgba(255,255,255,0.5); cursor: pointer;
          transition: all 0.2s; font-family: 'Segoe UI', sans-serif;
        }
        .demo-chip:hover {
          background: rgba(26,107,74,0.15);
          border-color: rgba(26,107,74,0.3); color: #4ade80;
        }
        .show-pass-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255,255,255,0.4); cursor: pointer;
          font-size: 16px; padding: 0; transition: color 0.2s;
        }
        .show-pass-btn:hover { color: rgba(255,255,255,0.8); }
      `}</style>

      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,107,74,0.2) 0%, transparent 70%)',
        top: '-100px', left: '-100px',
        transform: `translate(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px)`,
        transition: 'transform 0.15s ease', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        bottom: '-80px', right: '-80px',
        transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`,
        transition: 'transform 0.15s ease', pointerEvents: 'none',
      }} />

      {/* Left Panel - Branding — mobile-ல் hide */}
      {!isMobile && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 80px', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '15%', right: '10%', fontSize: 64, opacity: 0.12, animation: 'float 6s ease-in-out infinite' }}>💊</div>
          <div style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: 48, opacity: 0.1, animation: 'float2 8s ease-in-out infinite' }}>🧪</div>
          <div style={{ position: 'absolute', top: '55%', left: '5%', fontSize: 36, opacity: 0.08, animation: 'float 7s ease-in-out infinite 1s' }}>⚕️</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 60, animation: 'fadeInUp 0.6s ease forwards' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1a6b4a, #2d8a60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 20px rgba(26,107,74,0.4)' }}>💊</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>PharmAI</span>
          </div>

          <div style={{ animation: 'fadeInUp 0.6s ease 0.1s forwards', opacity: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, background: 'rgba(26,107,74,0.2)', border: '1px solid rgba(26,107,74,0.35)', fontSize: 12, color: '#4ade80', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Trusted by 500+ Pharmacies
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.15, color: '#fff', marginBottom: 20 }}>
              Your Pharmacy,<br />
              <span style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Smarter & Faster
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.7, maxWidth: 420, marginBottom: 48 }}>
              Manage drugs, patients, prescriptions and billing — all powered by AI. Built for modern pharmacies.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, animation: 'fadeInUp 0.6s ease 0.2s forwards', opacity: 0 }}>
            {['💊 Drug Inventory', '👥 Patients', '📋 Prescriptions', '🤖 AI Features', '💰 Billing'].map((f, i) => (
              <div key={i} style={{ padding: '8px 16px', borderRadius: 50, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{f}</div>
            ))}
          </div>
        </div>
      )}

      {/* Right Panel - Login Form */}
      <div style={{
        width: isMobile ? '100%' : 460,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '24px 16px' : '40px',
        position: 'relative', minHeight: isMobile ? '100vh' : 'auto',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: isMobile ? '32px 24px' : '44px 40px',
          backdropFilter: 'blur(20px)',
          animation: 'fadeInUp 0.7s ease 0.15s forwards',
          opacity: 0,
        }}>
          {/* Mobile logo */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #1a6b4a, #2d8a60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💊</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>PharmAI</span>
            </div>
          )}

          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to home
          </button>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>Sign in to your PharmAI account</p>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: 0.8 }}>EMAIL ADDRESS</label>
              <input className="input-field" type="email" placeholder="admin@pharmacy.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: 0.8 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight: 44 }} required />
                <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? '⏳ Signing in…' : '→  Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 10 }}>Quick demo access</p>
            <button className="demo-chip" onClick={() => setForm({ email: 'admin@pharmacy.com', password: 'password' })}>
              ⚡ Fill demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}