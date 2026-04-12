import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,222,128,${p.opacity})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const m = (e) => setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 30, y: (e.clientY / window.innerHeight - 0.5) * 30 });
    const s = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', m); window.addEventListener('scroll', s);
    return () => { window.removeEventListener('mousemove', m); window.removeEventListener('scroll', s); };
  }, []);

  const features = [
    { icon: '💊', title: 'Drug Inventory', desc: 'Real-time stock tracking with smart low-stock & expiry alerts.' },
    { icon: '👥', title: 'Patient Records', desc: 'Complete patient history, prescriptions and visit logs.' },
    { icon: '📋', title: 'Prescriptions', desc: 'Create, manage and dispense prescriptions seamlessly.' },
    { icon: '💰', title: 'Smart Billing', desc: 'Auto-generate bills, track revenue and manage payments.' },
    { icon: '⚠️', title: 'Inventory Alerts', desc: 'Notified before stock runs out or medicines expire.' },
    { icon: '🤖', title: 'AI Powered', desc: 'Smart drug interaction checks and AI-driven insights.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #060d1a 0%, #0a1f2e 45%, #071a10 100%)', fontFamily: "'Outfit','Segoe UI',sans-serif", color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-28px) rotate(8deg)} }
        @keyframes floatY2 { 0%,100%{transform:translateY(0) rotate(12deg)}50%{transform:translateY(22px) rotate(-6deg)} }
        @keyframes floatY3 { 0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 30px rgba(74,222,128,0.3)}50%{box-shadow:0 0 60px rgba(74,222,128,0.6)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.95)} }
        @keyframes ringRotate { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes ringRev { from{transform:rotate(0deg)}to{transform:rotate(-360deg)} }
        @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
        .btn-p{transition:all .25s ease}
        .btn-p:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 16px 48px rgba(26,107,74,.65)!important}
        .btn-s:hover{background:rgba(255,255,255,.12)!important;transform:translateY(-2px)}
        .fcard:hover{background:rgba(26,107,74,.14)!important;border-color:rgba(74,222,128,.3)!important;transform:translateY(-8px)!important;box-shadow:0 24px 48px rgba(0,0,0,.35)!important}
        .nbtn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(26,107,74,.55)!important}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:0, opacity:0.5 }} />

      {/* BG Orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(26,107,74,.18) 0%, transparent 65%)', top:'-200px', left:'-200px', transform:`translate(${mousePos.x*1.2}px,${mousePos.y*1.2}px)`, transition:'transform .12s ease' }} />
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 65%)', bottom:'-100px', right:'-100px', transform:`translate(${-mousePos.x}px,${-mousePos.y}px)`, transition:'transform .12s ease' }} />
      </div>

      {/* Navbar */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 60px', background: scrollY>60?'rgba(6,13,26,.92)':'transparent', backdropFilter: scrollY>60?'blur(24px)':'none', borderBottom: scrollY>60?'1px solid rgba(255,255,255,.07)':'none', transition:'all .3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#1a6b4a,#2d8a60)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, animation:'glow 3s ease-in-out infinite' }}>💊</div>
          <span style={{ fontSize:22, fontWeight:900, letterSpacing:-0.5 }}>PharmAI</span>
        </div>
        <button className="nbtn" onClick={() => navigate('/login')} style={{ padding:'10px 28px', borderRadius:50, background:'linear-gradient(135deg,#1a6b4a,#2d8a60)', border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:'0 4px 20px rgba(26,107,74,.4)' }}>
          Sign In →
        </button>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'120px 80px 80px', position:'relative', zIndex:1, gap:40, flexWrap:'wrap' }}>
        {/* Left */}
        <div style={{ flex:'1 1 480px', maxWidth:580 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px', borderRadius:50, background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.25)', fontSize:13, color:'#4ade80', marginBottom:28, animation:'fadeUp .6s ease forwards' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 2s infinite' }} />
            AI-Powered Pharmacy Suite • 2026
          </div>
          <h1 style={{ fontSize:'clamp(40px,5.5vw,70px)', fontWeight:900, lineHeight:1.08, marginBottom:24, animation:'fadeUp .7s ease .1s forwards', opacity:0, letterSpacing:-2 }}>
            The Smarter Way<br/>to{' '}
            <span style={{ background:'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'shimmer 3s linear infinite' }}>Manage Your</span><br/>Pharmacy
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,.55)', lineHeight:1.75, marginBottom:40, animation:'fadeUp .7s ease .2s forwards', opacity:0, maxWidth:480 }}>
            Intelligent inventory management, patient records, AI-powered billing and real-time insights — all in one beautiful platform.
          </p>
          <div style={{ display:'flex', gap:14, marginBottom:52, animation:'fadeUp .7s ease .3s forwards', opacity:0, flexWrap:'wrap' }}>
            <button className="btn-p" onClick={() => navigate('/login')} style={{ padding:'15px 38px', borderRadius:50, background:'linear-gradient(135deg,#1a6b4a,#2d8a60)', border:'none', color:'#fff', fontWeight:700, fontSize:16, cursor:'pointer', boxShadow:'0 8px 32px rgba(26,107,74,.5)' }}>
              Get Started Free
            </button>
            <button className="btn-s" onClick={() => document.getElementById('features').scrollIntoView({behavior:'smooth'})} style={{ padding:'15px 38px', borderRadius:50, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', fontWeight:600, fontSize:16, cursor:'pointer', transition:'all .2s' }}>
              See Features ↓
            </button>
          </div>
          <div style={{ display:'flex', gap:40, animation:'fadeUp .7s ease .4s forwards', opacity:0 }}>
            {[{num:'10K+',label:'Prescriptions'},{num:'99.9%',label:'Uptime'},{num:'500+',label:'Pharmacies'}].map((s,i)=>(
              <div key={i}>
                <div style={{ fontSize:28, fontWeight:900, color:'#4ade80', letterSpacing:-1 }}>{s.num}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — 3D Pills Visual */}
        <div style={{ flex:'0 0 440px', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', height:500, animation:'fadeUp .8s ease .2s forwards', opacity:0 }}>
          {/* Rings */}
          <div style={{ position:'absolute', width:420, height:420, borderRadius:'50%', border:'1px dashed rgba(74,222,128,.18)', animation:'ringRotate 22s linear infinite' }} />
          <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', border:'1px solid rgba(74,222,128,.1)', animation:'ringRev 16s linear infinite' }}>
            {[0,60,120,180,240,300].map((deg,i)=>(
              <div key={i} style={{ position:'absolute', width:8, height:8, borderRadius:'50%', background:'#4ade80', opacity:0.45, top:'50%', left:'50%', transform:`rotate(${deg}deg) translateX(148px) translateY(-4px)` }} />
            ))}
          </div>
          {/* Glow */}
          <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,107,74,.45) 0%,transparent 70%)', transform:`translate(${mousePos.x*.3}px,${mousePos.y*.3}px)`, transition:'transform .1s ease' }} />

          {/* Main Green Pill SVG */}
          <div style={{ position:'relative', zIndex:2, animation:'floatY 5s ease-in-out infinite', filter:'drop-shadow(0 30px 60px rgba(26,107,74,.6))' }}>
            <svg width="160" height="260" viewBox="0 0 160 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#15803d"/></linearGradient>
                <linearGradient id="gb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
                <linearGradient id="gs" x1="0%" y1="0%" x2="40%" y2="100%"><stop offset="0%" stopColor="rgba(255,255,255,.35)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></linearGradient>
              </defs>
              <ellipse cx="80" cy="65" rx="62" ry="65" fill="url(#gt)"/>
              <rect x="18" y="65" width="124" height="62" fill="url(#gt)"/>
              <rect x="18" y="122" width="124" height="5" fill="rgba(0,0,0,.18)"/>
              <rect x="18" y="127" width="124" height="68" fill="url(#gb)"/>
              <ellipse cx="80" cy="195" rx="62" ry="65" fill="url(#gb)"/>
              <ellipse cx="80" cy="65" rx="62" ry="65" fill="url(#gs)" opacity="0.6"/>
              <rect x="18" y="65" width="62" height="62" fill="url(#gs)" opacity="0.4"/>
              <ellipse cx="56" cy="42" rx="22" ry="10" fill="rgba(255,255,255,.25)"/>
            </svg>
          </div>

          {/* Small Orange Pill */}
          <div style={{ position:'absolute', top:'6%', right:'6%', animation:'floatY2 6s ease-in-out infinite', filter:'drop-shadow(0 8px 20px rgba(245,158,11,.45))' }}>
            <svg width="50" height="80" viewBox="0 0 50 80" fill="none">
              <defs>
                <linearGradient id="ot" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
                <linearGradient id="ob" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient>
              </defs>
              <ellipse cx="25" cy="14" rx="18" ry="14" fill="url(#ot)"/>
              <rect x="7" y="14" width="36" height="26" fill="url(#ot)"/>
              <rect x="7" y="38" width="36" height="3" fill="rgba(0,0,0,.15)"/>
              <rect x="7" y="41" width="36" height="25" fill="url(#ob)"/>
              <ellipse cx="25" cy="66" rx="18" ry="14" fill="url(#ob)"/>
              <ellipse cx="18" cy="9" rx="7" ry="4" fill="rgba(255,255,255,.28)"/>
            </svg>
          </div>

          {/* Small Blue Pill */}
          <div style={{ position:'absolute', bottom:'8%', left:'4%', animation:'floatY3 7s ease-in-out infinite 1s', filter:'drop-shadow(0 8px 20px rgba(96,165,250,.4))' }}>
            <svg width="40" height="64" viewBox="0 0 40 64" fill="none">
              <defs>
                <linearGradient id="bt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient>
                <linearGradient id="bb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e0f2fe"/><stop offset="100%" stopColor="#7dd3fc"/></linearGradient>
              </defs>
              <ellipse cx="20" cy="11" rx="15" ry="11" fill="url(#bt)"/>
              <rect x="5" y="11" width="30" height="21" fill="url(#bt)"/>
              <rect x="5" y="30" width="30" height="3" fill="rgba(0,0,0,.12)"/>
              <rect x="5" y="33" width="30" height="20" fill="url(#bb)"/>
              <ellipse cx="20" cy="53" rx="15" ry="11" fill="url(#bb)"/>
              <ellipse cx="14" cy="7" rx="6" ry="3" fill="rgba(255,255,255,.3)"/>
            </svg>
          </div>

          {/* Floating badges */}
          {[
            { label:'💊 Drug Inventory', top:'10%', left:'-5%', delay:'0s' },
            { label:'🤖 AI Analysis', top:'42%', right:'-10%', delay:'0.4s' },
            { label:'📋 Prescriptions', bottom:'16%', left:'-8%', delay:'0.8s' },
          ].map((b,i)=>(
            <div key={i} style={{ position:'absolute', ...b, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:50, padding:'8px 16px', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.85)', whiteSpace:'nowrap', backdropFilter:'blur(10px)', animation:`floatY3 ${5+i}s ease-in-out infinite ${b.delay}`, boxShadow:'0 4px 20px rgba(0,0,0,.3)' }}>
              {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding:'60px 80px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ display:'inline-block', padding:'6px 18px', borderRadius:50, background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', fontSize:12, color:'#4ade80', marginBottom:16 }}>FEATURES</div>
          <h2 style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:900, letterSpacing:-1, marginBottom:12 }}>Everything Your Pharmacy Needs</h2>
          <p style={{ color:'rgba(255,255,255,.45)', fontSize:16, maxWidth:460, margin:'0 auto' }}>Powerful tools built specifically for modern pharmacies</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, maxWidth:1100, margin:'0 auto' }}>
          {features.map((f,i)=>(
            <div key={i} className="fcard" style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:20, padding:'30px 26px', transition:'all .3s ease' }}>
              <div style={{ width:50, height:50, borderRadius:13, background:'rgba(26,107,74,.2)', border:'1px solid rgba(26,107,74,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:16 }}>{f.icon}</div>
              <div style={{ fontSize:17, fontWeight:700, marginBottom:8, letterSpacing:-0.3 }}>{f.title}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,.45)', lineHeight:1.75 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ margin:'0 80px 80px', borderRadius:28, background:'linear-gradient(135deg,#0f3d28 0%,#1a6b4a 50%,#2d8a60 100%)', padding:'64px', textAlign:'center', position:'relative', overflow:'hidden', zIndex:1 }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,.05)' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:38, fontWeight:900, marginBottom:14, letterSpacing:-1 }}>Ready to Modernize Your Pharmacy?</h2>
          <p style={{ color:'rgba(255,255,255,.65)', marginBottom:36, fontSize:16 }}>Join 500+ pharmacies already running smarter with PharmAI</p>
          <button className="btn-p" onClick={()=>navigate('/login')} style={{ padding:'16px 44px', borderRadius:50, background:'#fff', border:'none', color:'#1a6b4a', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,.2)' }}>
            Start For Free →
          </button>
        </div>
      </div>

      <footer style={{ textAlign:'center', padding:'32px', color:'rgba(255,255,255,.25)', fontSize:13, borderTop:'1px solid rgba(255,255,255,.05)', position:'relative', zIndex:1 }}>
        © 2026 PharmAI Pharmacy Suite • Built with ❤️ for modern pharmacies
      </footer>
    </div>
  );
}