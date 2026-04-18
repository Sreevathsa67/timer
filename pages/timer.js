// pages/timer.js — Event Timer
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

export default function Timer() {
  const [seconds, setSeconds] = useState(61200);
  const [totalSeconds, setTotalSeconds] = useState(61200);
  const [isRunning, setIsRunning] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);
  const [showSetTime, setShowSetTime] = useState(false);
  const [inputH, setInputH] = useState('17');
  const [inputM, setInputM] = useState('00');
  const [inputS, setInputS] = useState('00');
  const [showHints, setShowHints] = useState(true);
  const [shimmer, setShimmer] = useState(false);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Ambient particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.1 + Math.random() * 0.4),
      size: 0.4 + Math.random() * 1.2,
      life: Math.random(),
      lifeSpeed: 0.002 + Math.random() * 0.005,
      opacity: 0.15 + Math.random() * 0.35,
      color: Math.random() > 0.5 ? 'gold' : 'white',
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life += p.lifeSpeed;
        if (p.y < -10 || p.life > 1) {
          p.x = Math.random() * W; p.y = H + 10; p.life = 0;
        }
        const a = Math.sin(p.life * Math.PI) * p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color === 'gold' ? `rgba(255,180,40,${a})` : `rgba(255,255,255,${a * 0.5})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 0) { clearInterval(intervalRef.current); setIsRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && seconds % 600 === 0 && seconds !== totalSeconds) {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 600);
    }
  }, [seconds]);

  const pad = n => String(n).padStart(2, '0');
  const formatTime = s => `${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`;
  const start  = () => { if (seconds > 0) setIsRunning(true); };
  const pause  = () => setIsRunning(false);
  const reset  = () => { setIsRunning(false); setSeconds(totalSeconds); };
  const toggleCrisis = () => setCrisisMode(p => !p);

  const applyTime = () => {
    const t = (parseInt(inputH)||0)*3600 + (parseInt(inputM)||0)*60 + (parseInt(inputS)||0);
    setTotalSeconds(t); setSeconds(t); setIsRunning(false); setShowSetTime(false);
  };

  useEffect(() => {
    const onKey = e => {
      if (showSetTime) { if (e.key === 'Escape') setShowSetTime(false); return; }
      switch (e.key.toLowerCase()) {
        case 's': start(); break;
        case 'p': pause(); break;
        case 'r': reset(); break;
        case 'c': toggleCrisis(); break;
        case 't': setShowSetTime(p => !p); break;
        case 'h': setShowHints(p => !p); break;
        case 'escape': if (crisisMode) setCrisisMode(false); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, seconds, totalSeconds, showSetTime, crisisMode]);

  const pct = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const isComplete = seconds === 0 && totalSeconds > 0;
  const h = Math.floor(seconds/3600);
  const m = Math.floor((seconds%3600)/60);
  const s = seconds%60;
  const urgency = totalSeconds > 0 ? seconds / totalSeconds : 1;

  const timerColor = urgency < 0.1 ? '#ff3c3c' : urgency < 0.25 ? '#ffaa28' : '#ffffff';
  const timerGlow  = urgency < 0.1 ? 'rgba(255,40,40,0.6)' : urgency < 0.25 ? 'rgba(255,140,20,0.45)' : 'rgba(255,180,60,0.2)';

  return (
    <>
      <Head>
        <title>E-Week · Startup Odyssey</title>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { overflow:hidden; width:100vw; height:100vh; background:#030108; font-family:'Rajdhani',sans-serif; cursor:none; }

        .cursor-dot { position:fixed; width:8px; height:8px; background:rgba(255,160,40,0.9); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); mix-blend-mode:difference; }

        /* ── BG ── */
        .bg-base { position:fixed; inset:0; z-index:0; background:radial-gradient(ellipse at 50% 50%, #0d0308 0%, #030108 55%, #010005 100%); }
        .bg-accent { position:fixed; inset:0; z-index:0; background: radial-gradient(ellipse at 50% 100%, rgba(255,80,0,0.06) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(80,0,200,0.04) 0%, transparent 50%); }
        .particles { position:fixed; inset:0; z-index:1; pointer-events:none; }
        .scanlines { position:fixed; inset:0; z-index:2; pointer-events:none; background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px); }

        /* ── Top bar ── */
        .top-strip { position:fixed; top:0; left:0; right:0; z-index:20; height:2px; background:linear-gradient(90deg,transparent,rgba(255,100,0,0.3) 20%,rgba(255,200,60,0.9) 50%,rgba(255,100,0,0.3) 80%,transparent); box-shadow:0 0 20px rgba(255,140,20,0.4); animation:barPulse 3s ease-in-out infinite alternate; }
        @keyframes barPulse { 0%{opacity:0.5} 100%{opacity:1} }

        .topbar { position:fixed; top:0; left:0; right:0; z-index:19; display:flex; align-items:center; justify-content:space-between; padding:1.4rem 2rem; background:linear-gradient(to bottom,rgba(3,1,8,0.8),transparent); }
        .topbar-left { display:flex; flex-direction:column; gap:0.1rem; }
        .topbar-brand { font-family:'Bebas Neue',sans-serif; font-size:1.15rem; letter-spacing:0.25em; color:rgba(255,255,255,0.6); }
        .topbar-sub { font-family:'Cinzel',serif; font-size:0.5rem; letter-spacing:0.35em; color:rgba(255,160,40,0.5); text-transform:uppercase; }
        .topbar-right { display:flex; gap:0.6rem; }
        .icon-btn { width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,160,40,0.18); background:rgba(255,140,20,0.04); color:rgba(255,160,40,0.5); display:flex; align-items:center; justify-content:center; cursor:none; font-size:0.85rem; transition:all 0.2s; backdrop-filter:blur(6px); }
        .icon-btn:hover { background:rgba(255,140,20,0.12); color:rgba(255,200,80,1); border-color:rgba(255,160,40,0.5); }

        /* ── Corners ── */
        .corner { position:fixed; width:28px; height:28px; z-index:15; }
        .corner::before,.corner::after { content:''; position:absolute; background:rgba(255,140,40,0.35); }
        .corner::before { width:2px; height:100%; }
        .corner::after  { width:100%; height:2px; }
        .corner.tl { top:1rem; left:1rem; }
        .corner.tr { top:1rem; right:1rem; transform:scaleX(-1); }
        .corner.bl { bottom:1rem; left:1rem; transform:scaleY(-1); }
        .corner.br { bottom:1rem; right:1rem; transform:scale(-1); }

        /* ── Stage ── */
        .stage { position:relative; z-index:10; width:100vw; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }

        /* ── Outer ring decoration around timer ── */
        .timer-ring {
          position:relative;
          display:flex; flex-direction:column; align-items:center;
          padding: 3rem;
        }
        .timer-ring::before {
          content:'';
          position:absolute; inset:-10px;
          border-radius:50%;
          border:1px solid rgba(255,140,40,0.08);
          box-shadow: 0 0 60px rgba(255,100,0,0.06), inset 0 0 60px rgba(255,100,0,0.04);
          animation: ringPulse 4s ease-in-out infinite alternate;
          pointer-events:none;
        }
        .timer-ring::after {
          content:'';
          position:absolute; inset:-30px;
          border-radius:50%;
          border:1px solid rgba(255,140,40,0.04);
          animation: ringPulse 4s ease-in-out 1s infinite alternate;
          pointer-events:none;
        }
        @keyframes ringPulse { 0%{opacity:0.4;transform:scale(0.98)} 100%{opacity:1;transform:scale(1.01)} }

        /* ── Timer ── */
        .timer-block { display:flex; flex-direction:column; align-items:center; position:relative; z-index:2; }

        .timer {
          font-family:'Orbitron',monospace; font-weight:900;
          font-size:clamp(4rem,16vw,13rem);
          line-height:1; letter-spacing:0.03em;
          color:${timerColor};
          text-shadow:0 0 60px ${timerGlow}, 0 0 140px ${timerGlow}55;
          transition:color 1.5s, text-shadow 1.5s;
          user-select:none;
          position:relative;
        }
        .timer.shimmer { animation:timerShimmer 0.6s ease; }
        @keyframes timerShimmer { 0%{opacity:1} 25%{opacity:0.3} 55%{opacity:1} 75%{opacity:0.6} 100%{opacity:1} }
        .timer.complete { animation:completePulse 1.2s ease-in-out infinite alternate; }
        @keyframes completePulse { 0%{opacity:1} 100%{opacity:0.4} }

        .colon { animation:blink 1s step-start infinite; }
        @keyframes blink { 50%{opacity:0.08} }

        /* ── Unit labels ── */
        .timer-labels { display:flex; margin-top:0.7rem; width:100%; justify-content:space-around; padding:0 0.5rem; }
        .timer-unit-label { font-family:'Cinzel',serif; font-size:clamp(0.4rem,0.85vw,0.55rem); letter-spacing:0.55em; color:rgba(255,160,40,0.3); text-transform:uppercase; flex:1; text-align:center; }

        /* ── Progress ── */
        .progress-wrap { width:clamp(260px,50vw,660px); margin-top:2.4rem; }
        .progress-track { height:2px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:visible; position:relative; }
        .progress-fill { height:100%; border-radius:2px; transition:width 1s linear; background:linear-gradient(90deg,rgba(255,120,20,0.4),rgba(255,200,60,0.95)); box-shadow:0 0 12px rgba(255,160,40,0.5); }
        .progress-dot { position:absolute; top:50%; transform:translate(-50%,-50%); width:6px; height:6px; border-radius:50%; background:#ffcc44; box-shadow:0 0 10px rgba(255,200,60,1), 0 0 20px rgba(255,160,40,0.6); transition:left 1s linear; }
        .progress-meta { display:flex; justify-content:space-between; margin-top:0.6rem; }
        .progress-meta span { font-size:0.5rem; letter-spacing:0.3em; color:rgba(255,255,255,0.18); }

        /* ── Status ── */
        .status { margin-top:1.1rem; font-size:clamp(0.55rem,1vw,0.72rem); letter-spacing:0.6em; text-transform:uppercase; font-weight:600; transition:color 0.5s; }
        .status.idle    { color:rgba(255,255,255,0.2); }
        .status.running { color:rgba(80,230,140,0.8); }
        .status.paused  { color:rgba(255,180,50,0.8); }
        .status.done    { color:rgba(255,70,90,0.9); }

        /* ── Bottom controls ── */
        .bottom { position:fixed; bottom:0; left:0; right:0; z-index:20; display:flex; flex-direction:column; align-items:center; padding:0 2rem 2rem; background:linear-gradient(to top,rgba(3,1,8,0.85) 0%,transparent 100%); }
        .ctrl-btns { display:flex; gap:0.8rem; margin-bottom:1.4rem; }
        .ctrl-btn { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:0.72rem; letter-spacing:0.28em; text-transform:uppercase; padding:0.65rem 1.8rem; border-radius:2px; cursor:none; transition:all 0.22s; backdrop-filter:blur(8px); position:relative; overflow:hidden; }
        .ctrl-start { background:rgba(30,140,70,0.1); border:1px solid rgba(40,180,80,0.28); color:rgba(80,230,130,0.9); }
        .ctrl-start:hover { background:rgba(30,140,70,0.22); border-color:rgba(40,200,80,0.65); box-shadow:0 0 20px rgba(40,180,80,0.12); }
        .ctrl-pause { background:rgba(180,110,10,0.1); border:1px solid rgba(220,150,20,0.25); color:rgba(255,190,60,0.85); }
        .ctrl-pause:hover { background:rgba(180,110,10,0.22); border-color:rgba(240,160,30,0.6); }
        .ctrl-reset { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); color:rgba(255,255,255,0.38); }
        .ctrl-reset:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.28); color:rgba(255,255,255,0.75); }

        .hints { display:flex; gap:1.6rem; flex-wrap:wrap; justify-content:center; transition:opacity 0.4s; }
        .hints.hidden { opacity:0; pointer-events:none; }
        .hint-item { font-size:0.58rem; letter-spacing:0.18em; color:rgba(255,255,255,0.15); text-transform:uppercase; }
        .hint-item kbd { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:0.58rem; color:rgba(255,160,40,0.45); border:1px solid rgba(255,160,40,0.18); padding:0.1rem 0.4rem; border-radius:2px; margin-right:0.3rem; }

        /* ── Modal ── */
        .overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.75); backdrop-filter:blur(18px); opacity:0; pointer-events:none; transition:opacity 0.3s; }
        .overlay.open { opacity:1; pointer-events:all; }
        .modal-box { background:rgba(5,3,12,0.97); border:1px solid rgba(255,140,40,0.18); padding:2.5rem 3rem; min-width:320px; text-align:center; transform:translateY(16px); transition:transform 0.3s; box-shadow:0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(255,100,20,0.06); }
        .overlay.open .modal-box { transform:translateY(0); }
        .modal-title { font-family:'Cinzel',serif; font-size:1rem; letter-spacing:0.25em; color:rgba(255,160,40,0.85); margin-bottom:0.4rem; }
        .modal-sub { font-size:0.65rem; color:rgba(255,255,255,0.18); letter-spacing:0.2em; margin-bottom:1.8rem; }
        .time-fields { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-bottom:1.8rem; }
        .time-fields input { width:72px; font-family:'Orbitron',monospace; font-size:2rem; font-weight:700; text-align:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); color:#fff; padding:0.5rem 0.2rem; outline:none; border-radius:2px; transition:border-color 0.2s; }
        .time-fields input:focus { border-color:rgba(255,160,40,0.55); }
        .time-sep { font-family:'Orbitron',monospace; font-size:2rem; color:rgba(255,255,255,0.12); }
        .modal-actions { display:flex; gap:0.8rem; justify-content:center; }
        .mact { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.5); padding:0.55rem 1.4rem; cursor:none; border-radius:2px; transition:all 0.2s; }
        .mact:hover { background:rgba(255,255,255,0.08); color:#fff; }
        .mact.primary { border-color:rgba(255,160,40,0.4); color:rgba(255,160,40,0.9); }
        .mact.primary:hover { background:rgba(255,110,10,0.14); color:#fff; border-color:rgba(255,160,40,0.85); }

        /* ── CRISIS ── */
        .crisis { position:fixed; inset:0; z-index:50; background:#040000; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.5s; overflow:hidden; }
        .crisis.on { opacity:1; pointer-events:all; }
        .crisis-bg-glow { position:absolute; inset:0; background:radial-gradient(ellipse at 50% 50%,rgba(220,0,0,0.3) 0%,transparent 65%),radial-gradient(ellipse at 25% 85%,rgba(150,0,0,0.18) 0%,transparent 50%); animation:cpulse 2s ease-in-out infinite alternate; }
        @keyframes cpulse { 0%{opacity:0.55} 100%{opacity:1} }
        .crisis-stripes { position:absolute; inset:0; background:repeating-linear-gradient(-52deg,transparent,transparent 55px,rgba(180,0,0,0.022) 55px,rgba(180,0,0,0.022) 110px); }
        .crisis-topbar { position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#900,#f40,#ff0,#f40,#900); background-size:200%; animation:barscroll 1.1s linear infinite; box-shadow:0 0 25px rgba(255,50,0,0.8); }
        .crisis-btmbar { position:absolute; bottom:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#900,#f40,#ff0,#f40,#900); background-size:200%; animation:barscroll 1.1s linear infinite reverse; box-shadow:0 0 25px rgba(255,50,0,0.8); }
        @keyframes barscroll { 0%{background-position:0%} 100%{background-position:200%} }
        .crisis-content { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; }
        .crisis-tag { font-family:'Rajdhani',sans-serif; font-weight:600; font-size:clamp(0.55rem,1.3vw,0.78rem); letter-spacing:0.8em; text-transform:uppercase; color:rgba(255,70,50,0.55); margin-bottom:1.5rem; animation:flicker 4s step-start infinite; }
        @keyframes flicker { 0%,85%,90%,100%{opacity:1} 86%,91%{opacity:0.12} }
        .crisis-main { font-family:'Bebas Neue',sans-serif; font-size:clamp(4rem,16vw,14rem); line-height:0.88; text-align:center; letter-spacing:0.05em; color:#fff; animation:cglow 1.5s ease-in-out infinite alternate; }
        @keyframes cglow { 0%{text-shadow:0 0 40px rgba(255,0,0,1),0 0 90px rgba(255,0,0,0.45)} 100%{text-shadow:0 0 65px rgba(255,50,0,1),0 0 140px rgba(255,0,0,0.7),0 0 220px rgba(200,0,0,0.3)} }
        .crisis-div { width:clamp(140px,30vw,360px); height:1px; background:linear-gradient(90deg,transparent,rgba(255,60,0,0.55),transparent); margin:1.8rem 0; }
        .crisis-time { font-family:'Orbitron',monospace; font-weight:700; font-size:clamp(1.4rem,5vw,3rem); color:rgba(255,100,80,0.95); letter-spacing:0.08em; text-shadow:0 0 30px rgba(255,0,0,0.6); }
        .crisis-hint { position:absolute; bottom:2rem; font-size:0.56rem; letter-spacing:0.45em; color:rgba(255,60,60,0.22); text-transform:uppercase; }
        .crisis.on .corner::before,.crisis.on .corner::after { background:rgba(255,50,0,0.55); animation:alertCorner 1s ease-in-out infinite alternate; }
        @keyframes alertCorner { 0%{opacity:0.2} 100%{opacity:1} }
        /* ── Logos ── */
        .logo-bar { display:flex; align-items:center; gap:0.8rem; }
        .logo-vvce { height:52px; width:52px; object-fit:contain; border-radius:50%; background:rgba(255,255,255,0.95); padding:2px; }
        .logo-event { height:42px; object-fit:contain; }
        .logo-sep { width:1px; height:26px; background:rgba(255,160,40,0.2); }

        /* ── Sponsors bar ── */
        .sponsors-bar { position:fixed; bottom:7rem; left:0; right:0; z-index:15; display:flex; align-items:center; justify-content:center; gap:2.5rem; pointer-events:none; }
        .sponsors-label { font-family:'Rajdhani',sans-serif; font-weight:600; font-size:0.5rem; letter-spacing:0.6em; color:rgba(255,160,40,0.5); text-transform:uppercase; white-space:nowrap; }
        .sponsor-sep { width:1px; height:30px; background:rgba(255,160,40,0.2); }
        .sponsor-wrap { pointer-events:all; transition:transform 0.3s; }
        .sponsor-wrap:hover { transform:scale(1.1); }
        .sponsor-img { height:55px; object-fit:contain; display:block; }

      `}</style>

      <div className="cursor-dot" id="cursorDot" />

      {/* BG layers */}
      <div className="bg-base" />
      <div className="bg-accent" />
      <canvas className="particles" ref={canvasRef} />
      <div className="scanlines" />

      {/* Corners */}
      <div className="corner tl" /><div className="corner tr" />
      <div className="corner bl" /><div className="corner br" />

      {/* Top accent line */}
      <div className="top-strip" />

      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-bar">
            <img src="/vvce.png" className="logo-vvce" alt="VVCE" />
            <div className="logo-sep" />
            <img src="/eweek-logo.png" className="logo-event" alt="E-Week" />
          </div>
          <span className="topbar-sub" style={{marginTop:'0.2rem'}}>Startup Odyssey · E-Cell Aspera</span>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" title="Set time (T)" onClick={() => setShowSetTime(true)}>⏱</button>
        </div>
      </div>

      {/* Stage */}
      <div className="stage">
        <div className="timer-ring">
          <div className="timer-block">
            <div className={`timer${isComplete ? ' complete' : shimmer ? ' shimmer' : ''}`}>
              <span>{pad(h)}</span>
              <span className="colon">:</span>
              <span>{pad(m)}</span>
              <span className="colon">:</span>
              <span>{pad(s)}</span>
            </div>

            <div className="timer-labels">
              <span className="timer-unit-label">Hours</span>
              <span className="timer-unit-label" style={{flex:'0 0 12%'}} />
              <span className="timer-unit-label">Minutes</span>
              <span className="timer-unit-label" style={{flex:'0 0 12%'}} />
              <span className="timer-unit-label">Seconds</span>
            </div>

            <div className="progress-wrap">
              <div className="progress-track">
                <div className="progress-fill" style={{width: pct + '%'}} />
                <div className="progress-dot" style={{left: `${pct}%`}} />
              </div>
              <div className="progress-meta">
                <span>Start</span>
                <span>{Math.round(pct)}% elapsed</span>
                <span>End</span>
              </div>
            </div>

            <div className={`status ${isRunning ? 'running' : isComplete ? 'done' : seconds < totalSeconds ? 'paused' : 'idle'}`}>
              {isRunning ? '● Running' : isComplete ? '✓ Complete' : seconds < totalSeconds ? '⏸ Paused' : 'Press S to Start'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bottom">
        <div className="ctrl-btns">
          <button className="ctrl-btn ctrl-start" onClick={start}>▶ Start</button>
          <button className="ctrl-btn ctrl-pause" onClick={pause}>⏸ Pause</button>
          <button className="ctrl-btn ctrl-reset" onClick={reset}>↺ Reset</button>
        </div>
        <div className={`hints${showHints ? '' : ' hidden'}`}>
          <span className="hint-item"><kbd>S</kbd>Start</span>
          <span className="hint-item"><kbd>P</kbd>Pause</span>
          <span className="hint-item"><kbd>R</kbd>Reset</span>
          <span className="hint-item"><kbd>T</kbd>Set Time</span>
          <span className="hint-item"><kbd>C</kbd>Crisis</span>
          <span className="hint-item"><kbd>H</kbd>Hide Hints</span>
        </div>
      </div>

      {/* Set Time Modal */}
      <div className={`overlay${showSetTime ? ' open' : ''}`} onClick={e => { if(e.target.classList.contains('overlay')) setShowSetTime(false); }}>
        <div className="modal-box">
          <div className="modal-title">Set Timer</div>
          <div className="modal-sub">Hours · Minutes · Seconds</div>
          <div className="time-fields">
            <input type="number" min="0" max="99" value={inputH} onChange={e => setInputH(e.target.value)} />
            <span className="time-sep">:</span>
            <input type="number" min="0" max="59" value={inputM} onChange={e => setInputM(e.target.value)} />
            <span className="time-sep">:</span>
            <input type="number" min="0" max="59" value={inputS} onChange={e => setInputS(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="mact primary" onClick={applyTime}>Apply</button>
            <button className="mact" onClick={() => setShowSetTime(false)}>Cancel</button>
          </div>
        </div>
      </div>

      {/* Crisis */}
      <div className={`crisis${crisisMode ? ' on' : ''}`}>
        <div className="crisis-topbar" />
        <div className="crisis-btmbar" />
        <div className="crisis-bg-glow" />
        <div className="crisis-stripes" />
        <div className="crisis-content">
          <div className="crisis-tag">⚠ &nbsp; Alert Level Critical &nbsp; ⚠</div>
          <div className="crisis-main">CRISIS<br />MODE</div>
          <div className="crisis-div" />
          <div className="crisis-time">{formatTime(seconds)}</div>
        </div>
        <div className="crisis-hint">Press C to return to normal</div>
      </div>

      {/* Sponsors bar */}
      <div className="sponsors-bar">
        <span className="sponsors-label">Sponsors</span>
        <div className="sponsor-sep" />
        <div className="sponsor-wrap"><img src="/sponsor1.jpeg" className="sponsor-img" alt="GRS" /></div>
        <div className="sponsor-wrap"><img src="/sponsor2.jpeg" className="sponsor-img" alt="Ishana" /></div>
        <div className="sponsor-wrap"><img src="/sponsor3.jpeg" className="sponsor-img" alt="Rollify" /></div>
      </div>

      <script dangerouslySetInnerHTML={{__html:`
        document.addEventListener('mousemove', function(e) {
          var c = document.getElementById('cursorDot');
          if(c){ c.style.left = e.clientX+'px'; c.style.top = e.clientY+'px'; }
        });
      `}} />
    </>
  );
}