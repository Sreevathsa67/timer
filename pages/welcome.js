// pages/index.js — E-Week Welcome Page
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Welcome() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 150);
    const gi = setInterval(() => {
      if (Math.random() > 0.68) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 120);
      }
    }, 3800);
    return () => clearInterval(gi);
  }, []);

  // Fire ring canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;

    // Fire particles on rings
    const rings = [
      { r: Math.min(W, H) * 0.32, count: 120, speed: 0.004, offset: 0 },
      { r: Math.min(W, H) * 0.26, count: 90,  speed: -0.006, offset: 1.2 },
      { r: Math.min(W, H) * 0.20, count: 60,  speed: 0.009, offset: 2.4 },
    ];

    const particles = [];
    rings.forEach((ring, ri) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + ring.offset;
        particles.push({
          ring: ri,
          baseAngle: angle,
          angle,
          r: ring.r,
          speed: ring.speed * (0.8 + Math.random() * 0.4),
          size: 1.5 + Math.random() * 3,
          life: Math.random(),
          lifeSpeed: 0.008 + Math.random() * 0.015,
          flicker: Math.random() * Math.PI * 2,
          flickerSpeed: 0.05 + Math.random() * 0.1,
          radialDrift: (Math.random() - 0.5) * 18,
          tailLength: 3 + Math.random() * 8,
        });
      }
    });

    // Floating ember particles
    const embers = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.3 + Math.random() * 0.8),
      size: 0.5 + Math.random() * 1.5,
      life: Math.random(),
      lifeSpeed: 0.003 + Math.random() * 0.007,
      opacity: 0.3 + Math.random() * 0.5,
    }));

    let frame = 0;
    let raf;

    function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Draw outer glow rings (static)
      rings.forEach((ring, ri) => {
        const alpha = [0.06, 0.04, 0.03][ri];
        const gradient = ctx.createRadialGradient(cx, cy, ring.r - 30, cx, cy, ring.r + 30);
        gradient.addColorStop(0, `rgba(255,100,0,0)`);
        gradient.addColorStop(0.4, `rgba(255,80,0,${alpha})`);
        gradient.addColorStop(0.6, `rgba(255,140,0,${alpha * 1.5})`);
        gradient.addColorStop(1, `rgba(255,60,0,0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 60;
        ctx.stroke();
      });

      // Draw fire particles
      particles.forEach(p => {
        p.angle += p.speed;
        p.life += p.lifeSpeed;
        p.flicker += p.flickerSpeed;
        if (p.life > 1) p.life = 0;

        const flickerVal = Math.sin(p.flicker) * 0.5 + 0.5;
        const rOffset = p.radialDrift * Math.sin(p.life * Math.PI);
        const currentR = p.r + rOffset;
        const x = cx + Math.cos(p.angle) * currentR;
        const y = cy + Math.sin(p.angle) * currentR;

        // Life curve: bright in middle, fade at edges
        const lifeCurve = Math.sin(p.life * Math.PI);
        const alpha = lifeCurve * (0.6 + flickerVal * 0.4);

        // Color: core white-yellow → orange → red
        const temp = lifeCurve;
        const r = 255;
        const g = Math.floor(temp > 0.7 ? 220 : temp > 0.4 ? 120 + (temp - 0.4) * 333 : temp * 300);
        const b = Math.floor(temp > 0.8 ? 100 * (temp - 0.8) * 5 : 0);

        // Tail
        const tailAngle = p.angle - p.speed * p.tailLength * 15;
        const tx = cx + Math.cos(tailAngle) * currentR;
        const ty = cy + Math.sin(tailAngle) * currentR;

        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, `rgba(${r},${Math.floor(g*0.3)},0,0)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.size * lifeCurve;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, p.size * lifeCurve * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${Math.min(255,g+80)},${b + 40},${alpha * 0.9})`;
        ctx.fill();
      });

      // Central core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W,H) * 0.12);
      const pulse = Math.sin(frame * 0.025) * 0.3 + 0.7;
      coreGrad.addColorStop(0, `rgba(255,200,80,${0.12 * pulse})`);
      coreGrad.addColorStop(0.4, `rgba(255,100,0,${0.06 * pulse})`);
      coreGrad.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(W,H) * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Embers
      embers.forEach(e => {
        e.x += e.vx; e.y += e.vy;
        e.life += e.lifeSpeed;
        e.flicker = (e.flicker || 0) + 0.05;
        if (e.y < -10 || e.life > 1) {
          e.x = Math.random() * W;
          e.y = H + 10;
          e.life = 0;
          e.vx = (Math.random() - 0.5) * 0.5;
          e.vy = -(0.3 + Math.random() * 0.8);
        }
        const a = Math.sin(e.life * Math.PI) * e.opacity * (0.6 + Math.sin(e.flicker) * 0.4);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${140 + Math.floor(e.life * 60)},20,${a})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  const enter = () => {
    setVisible(false);
    setTimeout(() => router.push('/timer'), 800);
  };

  useEffect(() => {
    const onKey = e => { if (e.key === 'Enter' || e.key === ' ') enter(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700;900&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { width:100vw; height:100vh; overflow:hidden; background:#030108; font-family:'Rajdhani',sans-serif; cursor:none; }

        .cursor-dot { position:fixed; width:8px; height:8px; background:rgba(255,140,30,0.95); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); mix-blend-mode:difference; }

        .bg-base { position:fixed; inset:0; z-index:0; background:radial-gradient(ellipse at 50% 50%, #0d0308 0%, #030108 60%, #010005 100%); }

        .particles { position:fixed; inset:0; z-index:1; pointer-events:none; }

        .scanlines { position:fixed; inset:0; z-index:3; pointer-events:none; background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px); }

        /* top accent line */
        .top-bar { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(255,100,0,0.3) 20%,rgba(255,200,60,0.9) 50%,rgba(255,100,0,0.3) 80%,transparent); box-shadow:0 0 20px rgba(255,140,20,0.4); animation:barPulse 3s ease-in-out infinite alternate; }
        @keyframes barPulse { 0%{opacity:0.5} 100%{opacity:1} }

        .corner { position:absolute; width:32px; height:32px; }
        .corner::before, .corner::after { content:''; position:absolute; background:rgba(255,140,40,0.4); }
        .corner::before { width:2px; height:100%; }
        .corner::after  { width:100%; height:2px; }
        .corner.tl { top:1.8rem; left:1.8rem; }
        .corner.tr { top:1.8rem; right:1.8rem; transform:scaleX(-1); }
        .corner.bl { bottom:1.8rem; left:1.8rem; transform:scaleY(-1); }
        .corner.br { bottom:1.8rem; right:1.8rem; transform:scale(-1,-1); }

        .page { position:relative; z-index:10; width:100vw; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:opacity 1s ease; }
        .page.in { opacity:1; }

        .content { display:flex; flex-direction:column; align-items:center; text-align:center; padding:2rem; position:relative; z-index:5; }

        /* E-Cell Presents */
        .pre-label { font-family:'Rajdhani',sans-serif; font-weight:600; font-size:clamp(0.55rem,1.1vw,0.72rem); letter-spacing:0.85em; text-transform:uppercase; color:rgba(255,140,40,0.55); margin-bottom:1.8rem; animation:fadeUp 1s ease 0.4s both; }
        .pre-label::before,.pre-label::after { content:'—'; margin:0 0.8rem; opacity:0.3; letter-spacing:0; }

        .welcome-line { font-family:'Rajdhani',sans-serif; font-weight:300; font-size:clamp(0.8rem,1.8vw,1.1rem); letter-spacing:0.55em; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-bottom:0.4rem; animation:fadeUp 1s ease 0.6s both; }

        /* E-WEEK big title */
        .title-wrap { position:relative; margin-bottom:0.6rem; }
        .title-glow { position:absolute; inset:-30%; background:radial-gradient(ellipse at 50% 60%,rgba(255,100,20,0.18),transparent 65%); filter:blur(50px); pointer-events:none; animation:glowPulse 3s ease-in-out infinite alternate; }
        @keyframes glowPulse { 0%{opacity:0.5} 100%{opacity:1} }

        .main-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(6rem,22vw,20rem); line-height:0.85; letter-spacing:0.05em; color:#fff; text-shadow:0 4px 0 rgba(0,0,0,0.6),0 0 80px rgba(255,100,20,0.15); animation:titleReveal 1.4s cubic-bezier(0.16,1,0.3,1) 0.7s both; user-select:none; position:relative; }
        @keyframes titleReveal { from{opacity:0;transform:translateY(50px) scaleY(1.08)} to{opacity:1;transform:translateY(0) scaleY(1)} }

        .main-title.glitch::before { content:'E-WEEK'; position:absolute; top:0; left:4px; color:rgba(255,60,60,0.6); clip-path:inset(20% 0 55% 0); animation:gShift 0.12s steps(2); }
        .main-title.glitch::after  { content:'E-WEEK'; position:absolute; top:0; left:-4px; color:rgba(30,200,255,0.5); clip-path:inset(58% 0 12% 0); animation:gShift 0.12s steps(2) reverse; }
        @keyframes gShift { 0%{transform:translateX(0)} 50%{transform:translateX(-5px)} 100%{transform:translateX(3px)} }

        /* Aspera's biggest event */
        .sub-event { font-family:'Rajdhani',sans-serif; font-weight:500; font-size:clamp(0.75rem,1.8vw,1.15rem); letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.85); margin-bottom:0.5rem; animation:fadeUp 1s ease 1s both; }

        /* STARTUP ODYSSEY — Cinzel, majestic */
        .event-name { font-family:'Cinzel',serif; font-weight:700; font-size:clamp(1rem,3vw,2rem); letter-spacing:0.18em; text-transform:uppercase; color:#ffcc55; filter:drop-shadow(0 0 24px rgba(255,160,40,0.8)); animation:fadeUp 1s ease 1.1s both; }

        /* divider */
        .divider { display:flex; align-items:center; gap:0.8rem; margin:2rem 0 1.6rem; width:clamp(160px,35vw,380px); animation:fadeUp 1s ease 1.2s both; }
        .divider::before,.divider::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(255,140,40,0.2)); }
        .divider::after { background:linear-gradient(270deg,transparent,rgba(255,140,40,0.2)); }
        .div-diamond { width:5px; height:5px; background:rgba(255,140,40,0.7); transform:rotate(45deg); box-shadow:0 0 8px rgba(255,140,40,0.6); }

        /* CTA */
        .cta { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:clamp(0.65rem,1.3vw,0.85rem); letter-spacing:0.5em; text-transform:uppercase; color:#fff; background:transparent; border:none; cursor:none; padding:0; animation:fadeUp 1s ease 1.4s both; }
        .cta-inner { display:flex; align-items:center; gap:1rem; border:1px solid rgba(255,160,40,0.6); padding:0.9rem 2.6rem; background:rgba(255,90,10,0.15); backdrop-filter:blur(10px); transition:all 0.3s; position:relative; overflow:hidden; }
        .cta:hover .cta-inner { border-color:rgba(255,160,40,0.85); background:rgba(255,90,10,0.14); box-shadow:0 0 40px rgba(255,120,20,0.25),inset 0 0 20px rgba(255,100,10,0.05); transform:translateY(-2px); }
        .cta-shine { position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent); animation:shine 3.5s ease-in-out 2s infinite; }
        @keyframes shine { 0%{left:-100%} 40%,100%{left:150%} }
        .cta-arrow { transition:transform 0.3s; }
        .cta:hover .cta-arrow { transform:translateX(5px); }

        .cta-sub { margin-top:0.9rem; font-size:0.54rem; letter-spacing:0.35em; color:rgba(255,255,255,0.12); text-transform:uppercase; animation:fadeUp 1s ease 1.6s both; }

        /* bottom branding only */
        .branding { position:absolute; bottom:1.8rem; left:50%; transform:translateX(-50%); font-size:0.52rem; letter-spacing:0.65em; color:rgba(255,255,255,0.1); text-transform:uppercase; white-space:nowrap; animation:fadeIn 1s ease 2s both; }

        .side-label { position:absolute; left:2rem; top:50%; transform:translateY(-50%) rotate(-90deg); font-size:0.5rem; letter-spacing:0.55em; color:rgba(255,255,255,0.1); text-transform:uppercase; white-space:nowrap; animation:fadeIn 1s ease 2.2s both; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }

        /* ── Logos ── */
        .logo-bar { position:absolute; top:1.8rem; left:50%; transform:translateX(-50%); z-index:20; display:flex; align-items:center; gap:1.2rem; animation:fadeIn 1s ease 0.2s both; }
        .logo-vvce { height:44px; width:44px; object-fit:contain; border-radius:50%; border:1px solid rgba(255,160,40,0.25); background:rgba(255,255,255,0.06); padding:3px; filter:drop-shadow(0 0 8px rgba(255,140,40,0.3)); }
        .logo-event { height:38px; object-fit:contain; filter:brightness(1.1) drop-shadow(0 0 8px rgba(255,255,255,0.2)); }
        .logo-sep { width:1px; height:30px; background:rgba(255,160,40,0.2); }

        /* ── Sponsors ── */
        .sponsors-bar { position:absolute; bottom:1.6rem; left:0; right:0; z-index:20; display:flex; flex-direction:column; align-items:center; gap:0.5rem; animation:fadeIn 1s ease 2s both; }
        .sponsors-label { font-size:0.48rem; letter-spacing:0.65em; color:rgba(255,255,255,0.18); text-transform:uppercase; }
        .sponsors-logos { display:flex; align-items:center; gap:1.8rem; }
        .sponsor-img { height:28px; object-fit:contain; filter:grayscale(30%) brightness(1.1); opacity:0.7; transition:all 0.3s; }
        .sponsor-img:hover { opacity:1; filter:grayscale(0%) brightness(1.2); transform:scale(1.05); }
      `}</style>

      <div className="cursor-dot" id="cursor" />
      <div className="bg-base" />
      <canvas className="particles" ref={canvasRef} />
      <div className="scanlines" />

      <div className={`page${visible ? ' in' : ''}`}>
        <div className="top-bar" />

        {/* Logo bar - center top */}
        <div className="logo-bar">
          <img src="/vvce.png" className="logo-vvce" alt="VVCE" />
          <div className="logo-sep" />
          <img src="/eweek-logo.png" className="logo-event" alt="E-Week" />
        </div>
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />
        <div className="side-label">E-Cell Aspera · Startup Odyssey · E-Week 2025</div>
        {/* Sponsors */}
        <div className="sponsors-bar">
          <div className="sponsors-label">Our Sponsors</div>
          <div className="sponsors-logos">
            <img src="/sponsor1.jpeg" className="sponsor-img" alt="GRS Fantasy Park" />
            <img src="/sponsor2.jpeg" className="sponsor-img" alt="Ishana Foundation" />
            <img src="/sponsor3.jpeg" className="sponsor-img" alt="Rollify" />
          </div>
        </div>

        <div className="content">
          <div className="pre-label">E-Cell Presents</div>
          <div className="welcome-line">Welcome to</div>

          <div className="title-wrap">
            <div className="title-glow" />
            <h1 className={`main-title${glitching ? ' glitch' : ''}`}>E-Week</h1>
          </div>

          <div className="sub-event">Aspera's Biggest Event</div>
          <div className="event-name">Startup Odyssey</div>

          <div className="divider"><div className="div-diamond" /></div>

          <button className="cta" onClick={enter}>
            <div className="cta-inner">
              <div className="cta-shine" />
              Enter the Arena
              <span className="cta-arrow">→</span>
            </div>
          </button>
          <p className="cta-sub">Press Enter or Space to continue</p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{__html:`
        document.addEventListener('mousemove', function(e) {
          var c = document.getElementById('cursor');
          if(c){ c.style.left = e.clientX+'px'; c.style.top = e.clientY+'px'; }
        });
      `}} />
    </>
  );
}