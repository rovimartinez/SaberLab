import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, X, History, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

const PALETTE = ['#FF3D00','#FFD600','#00E676','#00B0FF','#651FFF','#F50057','#FF9100','#00E5FF'];

const enrolledGroups = [
  { id:'6a',  name:'Grado 6A - Robótica',    students:['Ana','Beto','Carla','David','Elena','Fernando','Gaby','Hugo'] },
  { id:'7b',  name:'Grado 7B - Electrónica',  students:['Camilo','Daniela','Esteban','Fabiana','Gabriel','Héctor','Ivonne','Javier'] },
  { id:'8c',  name:'Grado 8C - Programación', students:['Lucas','Marta','Néstor','Olivia','Paola','Quique','Rosa','Samuel'] },
  { id:'prf', name:'Sala de Profesores',      students:['Prof. García','Prof. López','Prof. Martínez','Prof. Rodríguez'] },
];

export default function Ruleta() {
  const [names,       setNames]       = useState(['Ana','Beto','Carla','David','Elena','Fernando','Gaby','Hugo']);
  const [namesText,   setNamesText]   = useState('Ana\nBeto\nCarla\nDavid\nElena\nFernando\nGaby\nHugo');
  const [isSpinning,  setIsSpinning]  = useState(false);
  const [angleDeg,    setAngleDeg]    = useState(0);
  const [winner,      setWinner]      = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [histOpen,    setHistOpen]    = useState(false);
  const [history,     setHistory]     = useState([]);
  const [soundOn,     setSoundOn]     = useState(true);
  const [autoRemove,  setAutoRemove]  = useState(true);
  const [tab,         setTab]         = useState('groups');
  const [zoom,        setZoom]        = useState(1);
  const [spinTime,    setSpinTime]    = useState(7);

  const canvasRef = useRef(null);
  const audioRef  = useRef(null);

  // ── Draw ──────────────────────────────────────────────────────────────
  const drawWheel = useCallback((list) => {
    const canvas = canvasRef.current;
    if (!canvas || !list.length) return;
    const ctx = canvas.getContext('2d');
    const S = 1000;
    canvas.width = S; canvas.height = S;
    const cx = S/2, cy = S/2, r = cx - 20;
    const slice = (2 * Math.PI) / list.length;
    ctx.clearRect(0, 0, S, S);
    list.forEach((name, i) => {
      const a = i * slice;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, a, a + slice);
      ctx.fillStyle = PALETTE[i % PALETTE.length]; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a + slice / 2);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
      const fs = list.length > 20 ? 18 : 30;
      ctx.font = `900 ${fs}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4;
      const label = name.length > 14 ? name.slice(0,13)+'…' : name;
      ctx.fillText(label.toUpperCase(), r - 40, 0);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(cx, cy, 28, 0, 2*Math.PI);
    ctx.fillStyle = '#0a0a14'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 3; ctx.stroke();
  }, []);

  useEffect(() => { drawWheel(names); }, [names, drawWheel]);

  // ── Audio ─────────────────────────────────────────────────────────────
  const initAudio = () => {
    if (!audioRef.current)
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
  };
  const beep = (freq = 440, dur = 0.06) => {
    if (!soundOn || !audioRef.current) return;
    try {
      const o = audioRef.current.createOscillator();
      const g = audioRef.current.createGain();
      o.connect(g); g.connect(audioRef.current.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.15, audioRef.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioRef.current.currentTime + dur);
      o.start(); o.stop(audioRef.current.currentTime + dur);
    } catch(_) {}
  };

  // ── Spin ──────────────────────────────────────────────────────────────
  const calcWinner = (finalAngle, list) => {
    const sliceDeg     = 360 / list.length;
    const pointerAngle = (360 - (finalAngle % 360) + 360) % 360;
    const idx          = Math.floor(pointerAngle / sliceDeg) % list.length;
    return list[idx];
  };

  const spin = () => {
    if (isSpinning || names.length < 2) return;
    initAudio(); beep(600, 0.08);
    setIsSpinning(true); setShowModal(false);
    
    // Increment base rotations so the extreme ease-out doesn't make it stop too fast
    const extra      = 3600 + Math.random() * 1440 + Math.random() * 360;
    const finalAngle = angleDeg + extra;
    setAngleDeg(finalAngle);
    
    const targetSpinMs = spinTime * 1000;
    
    // Audio ticks that organically slow down alongside the extreme ease-out curve
    const start = Date.now();
    let tickTimeout;
    const playTick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= targetSpinMs) return;
      beep(460 + Math.random() * 180, 0.04);
      const progress = elapsed / targetSpinMs;
      const delay = 50 + Math.pow(progress, 3) * 700;
      tickTimeout = setTimeout(playTick, Math.max(delay, 50));
    };
    playTick();

    setTimeout(() => {
      clearTimeout(tickTimeout);
      setIsSpinning(false);
      
      const w = calcWinner(finalAngle, names);
      setWinner(w);
      setHistory(prev => [w, ...prev]);
      
      // Delay de 1 segundo (1000ms) de suspenso antes del pop-up del ganador
      setTimeout(() => {
        beep(880, 0.4);
        confetti({
            particleCount: 150, spread: 80, origin: { y: 0.6 },
            colors: ['#4f46e5', '#ec4899', '#facc15', '#ffffff'],
            zIndex: 9999
        });

        if (autoRemove) {
          setNames(prev => prev.filter(n => n !== w));
        }
        setShowModal(true);
      }, 1000);

    }, targetSpinMs);
  };

  const loadGroup = (students) => {
    setNames(students);
    setNamesText(students.join('\n'));
    setPanelOpen(false);
  };

  const applyManual = () => {
    const parsed = namesText.split(/[,\n]/).map(n => n.trim()).filter(Boolean);
    if (parsed.length) { setNames(parsed); setPanelOpen(false); }
  };

  // ── Panel base styles ─────────────────────────────────────────────────
  const panelBase = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: 380,
    maxWidth: '100vw',
    background: 'rgba(5,7,20,0.98)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9000,
    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
  };

  return (
    <>
      {/* ── Main scene ── */}
      <div style={{
        width:'100%', height:'100vh',
        background:'#0a0a14', color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'sans-serif', position:'relative',
        overflow:'hidden', userSelect:'none',
      }}>
        {/* Glow */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 20% 30%,#4f46e5,transparent 45%)',opacity:.22}}/>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 80% 70%,#ec4899,transparent 45%)',opacity:.18}}/>
        </div>

        {/* Wheel */}
        <div style={{position:'relative',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',transform:`scale(${zoom})`,transition:'transform 0.3s cubic-bezier(0.2,0,0,1)'}}>
          {/* Pointer */}
          <div style={{position:'absolute',right:-6,top:'50%',transform:'translateY(-50%)',zIndex:60,pointerEvents:'none',display:'flex',alignItems:'center'}}>
            <div style={{width:0,height:0,borderTop:'13px solid transparent',borderBottom:'13px solid transparent',borderRight:'24px solid white',filter:'drop-shadow(0 2px 4px rgba(0,0,0,.6))'}}/>
            <div style={{width:50,height:36,background:'white',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,.4)'}}>
              <div style={{width:10,height:10,background:'#6366f1',borderRadius:'50%',boxShadow:'0 0 8px rgba(99,102,241,.8)'}}/>
            </div>
          </div>

          <div style={{position:'relative',width:'min(88vw,66vh,540px)',aspectRatio:'1/1',padding:10}}>
            <div style={{width:'100%',height:'100%',borderRadius:'50%',padding:10,background:'rgba(255,255,255,0.04)',border:'8px solid rgba(255,255,255,0.08)',boxShadow:'0 20px 60px rgba(0,0,0,.6)',position:'relative'}}>
              <canvas
                ref={canvasRef}
                style={{
                  width:'100%',height:'100%',borderRadius:'50%',display:'block',
                  transform:`rotate(${angleDeg}deg)`,
                  transition: isSpinning ? `transform ${spinTime * 1000}ms cubic-bezier(0.15,0,0,1)` : 'none',
                }}
              />
              <button
                onClick={spin}
                disabled={isSpinning || names.length < 2}
                style={{
                  position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
                  width:124,height:124,borderRadius:'50%',
                  border:'10px solid #0a0a14',zIndex:40,background:'white',
                  cursor:isSpinning?'not-allowed':'pointer',opacity:isSpinning?.5:1,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:'0 8px 32px rgba(0,0,0,.5)',
                  fontFamily:'sans-serif', transition:'transform .15s, opacity .2s',
                }}
                onMouseOver={e => { if(!isSpinning) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)' }}
                onMouseOut={e => { if(!isSpinning) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)' }}
                onMouseDown={e => { if(!isSpinning) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.95)' }}
                onMouseUp={e => { if(!isSpinning) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)' }}
              >
                <span style={{fontWeight:900,fontSize:22,fontStyle:'italic',color:'#0a0a14',letterSpacing:-1}}>GIRO</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top-Left: History */}
        <div style={{position:'absolute',left:20,top:20,display:'flex',flexDirection:'column',gap:10,zIndex:200}}>
          <IconBtn onClick={() => { setHistOpen(v=>!v); setPanelOpen(false); }} badge={history.length||null}>
            <History size={20}/>
          </IconBtn>
        </div>

        {/* Top-Right: Settings */}
        <div style={{position:'absolute',right:20,top:20,zIndex:200}}>
          <IconBtn onClick={() => { setPanelOpen(v=>!v); setHistOpen(false); }}>
            <Settings size={20}/>
          </IconBtn>
        </div>

        {/* Bottom-Left: Zoom controls */}
        <div style={{position:'absolute',left:20,bottom:20,display:'flex',flexDirection:'column',gap:10,zIndex:200}}>
          <IconBtn onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} title="Agrandar ruleta">
            <span style={{fontSize:24, fontWeight:900, marginTop: -2}}>+</span>
          </IconBtn>
          <IconBtn onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))} title="Reducir ruleta">
            <span style={{fontSize:24, fontWeight:900, marginTop: -4}}>−</span>
          </IconBtn>
        </div>

        {/* Bottom-Right: Audio, AutoElim, Multiplier */}
        <div style={{position:'absolute',right:20,bottom:20,display:'flex',flexDirection:'column',gap:10,zIndex:200}}>
          <IconBtn onClick={() => setSpinTime(v => v >= 10 ? 1 : v + 1)} title="Ajustar tiempo de giro">
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', lineHeight:1}}>
              <span style={{fontSize:14, fontWeight:900}}>{spinTime}s</span>
              <span style={{fontSize:7, fontWeight:900, opacity:0.8, marginTop:2, letterSpacing:'0.05em'}}>GIRO</span>
            </div>
          </IconBtn>
          <IconBtn onClick={() => { initAudio(); setSoundOn(v=>!v); }} title="Activar/Desactivar Sonido">
            {soundOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}
          </IconBtn>
          <IconBtn onClick={() => setAutoRemove(v=>!v)} active={autoRemove} title="Auto-eliminar ganador">
            <span style={{fontSize:9,fontWeight:900,textAlign:'center',lineHeight:1.3,textTransform:'uppercase',marginTop:-2}}>AUTO{'\n'}ELIM</span>
          </IconBtn>
          <IconBtn 
            onClick={() => { 
              if (!isSpinning && names.length < 200) {
                const unique = Array.from(new Set(names));
                setNames(prev => [...prev, ...unique]);
              }
            }} 
            title="Añadir porciones multiplicadoras a la ruleta"
          >
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', lineHeight:1}}>
              <span style={{fontSize:14, fontWeight:900, color:'#818cf8', fontStyle:'italic'}}>
                x{Math.floor(names.length / (new Set(names).size || 1))}
              </span>
              <span style={{fontSize:7, fontWeight:900, opacity:0.8, marginTop:2, letterSpacing:'0.05em'}}>
                {new Set(names).size} ALUM
              </span>
            </div>
          </IconBtn>
        </div>

        {/* Winner modal — inside main, z above glow but below panels */}
        {showModal && (
          <div onClick={() => setShowModal(false)}
            style={{position:'absolute',inset:0,zIndex:500,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}
          >
            <div onClick={e => e.stopPropagation()}
              style={{background:'#0d1024',border:'2px solid rgba(255,255,255,0.15)',padding:'44px 36px',borderRadius:36,textAlign:'center',maxWidth:300,width:'100%',boxShadow:'0 0 80px rgba(79,70,229,0.5)'}}
            >
              <div style={{fontSize:36,marginBottom:6}}>🏆</div>
              <p style={{color:'#818cf8',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.3em',fontSize:10,marginBottom:10,margin:'0 0 10px'}}>Ganador</p>
              <h2 style={{fontSize:36,fontWeight:900,fontStyle:'italic',textTransform:'uppercase',color:'#fff',marginBottom:28,lineHeight:1.2,wordBreak:'break-word'}}>{winner}</h2>
              <button onClick={() => setShowModal(false)}
                style={{width:'100%',padding:'14px 0',background:'white',color:'black',borderRadius:14,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.12em',border:'none',cursor:'pointer',fontSize:13}}
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL — position:fixed, sibling of main div, never clipped ── */}
      <div style={{
        ...panelBase,
        right: 0,
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        <div style={{padding:'22px 24px',borderBottom:'1px solid rgba(255,255,255,0.1)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.25)',flexShrink:0}}>
          <h2 style={{fontWeight:900,fontSize:15,textTransform:'uppercase',fontStyle:'italic',color:'#818cf8',margin:0}}>Panel Pro</h2>
          <button onClick={() => setPanelOpen(false)} style={closeBtnStyle}><X size={20}/></button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid rgba(255,255,255,0.1)',flexShrink:0}}>
          {['groups','manual'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{padding:'11px 0',fontSize:10,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.12em',background:tab===t?'rgba(99,102,241,0.15)':'transparent',color:tab===t?'#818cf8':'#475569',border:'none',borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent',cursor:'pointer',transition:'all .2s'}}>
              {t==='groups'?'Grupos':'Manual'}
            </button>
          ))}
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'18px 20px',display:'flex',flexDirection:'column',gap:10}}>
          {tab === 'groups' ? (
            enrolledGroups.map(g => (
              <button key={g.id} onClick={() => loadGroup(g.students)}
                style={{width:'100%',padding:'16px 18px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:18,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',color:'white',textAlign:'left',transition:'background .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.45)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
              >
                <div>
                  <p style={{fontWeight:900,fontSize:13,textTransform:'uppercase',margin:'0 0 3px'}}>{g.name}</p>
                  <p style={{fontSize:10,color:'#64748b',textTransform:'uppercase',margin:0}}>{g.students.length} estudiantes</p>
                </div>
                <span style={{fontSize:10,fontWeight:900,opacity:.35}}>CARGAR</span>
              </button>
            ))
          ) : (
             <div style={{display:'flex',flexDirection:'column',gap:10,flex:1}}>
              <p style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'0.1em',margin:0}}>Un nombre por línea</p>
              <textarea value={namesText} onChange={e=>setNamesText(e.target.value)}
                style={{flex:1,minHeight:240,width:'100%',background:'rgba(0,0,0,0.5)',border:'2px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'12px 14px',fontSize:13,fontWeight:700,color:'white',outline:'none',resize:'none',fontFamily:'monospace',boxSizing:'border-box',transition:'border-color .2s'}}
                onFocus={e=>e.target.style.borderColor='#6366f1'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
                placeholder={'Nombre 1\nNombre 2\nNombre 3...'}
              />
              <button onClick={applyManual}
                style={{width:'100%',padding:'13px 0',background:'#6366f1',color:'white',border:'none',borderRadius:14,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.12em',cursor:'pointer',fontSize:12,transition:'background .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#4f46e5'}
                onMouseLeave={e=>e.currentTarget.style.background='#6366f1'}
              >
                Guardar lista
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── LEFT PANEL — History ── */}
      <div style={{
        ...panelBase,
        left: 0,
        borderRight: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '8px 0 40px rgba(0,0,0,0.6)',
        transform: histOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        <div style={{padding:'22px 24px',borderBottom:'1px solid rgba(255,255,255,0.1)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.25)',flexShrink:0}}>
          <h2 style={{fontWeight:900,fontSize:15,textTransform:'uppercase',fontStyle:'italic',color:'#c084fc',margin:0}}>Historial</h2>
          <button onClick={() => setHistOpen(false)} style={closeBtnStyle}><X size={20}/></button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'18px 20px',display:'flex',flexDirection:'column',gap:8}}>
          {history.length===0
            ? <p style={{textAlign:'center',color:'#334155',fontSize:11,fontStyle:'italic',textTransform:'uppercase',paddingTop:28}}>Sin resultados aún</p>
            : history.map((h,i) => (
              <div key={i} style={{background:'rgba(255,255,255,0.05)',padding:'12px 16px',borderRadius:12,border:'1px solid rgba(255,255,255,0.08)',fontWeight:700,display:'flex',justifyContent:'space-between',alignItems:'center',color:'white'}}>
                <span>{h}</span>
                <span style={{color:'#818cf8',opacity:.4,fontSize:12}}>#{history.length-i}</span>
              </div>
            ))
          }
        </div>
        {history.length>0 && (
          <div style={{padding:'14px 20px',borderTop:'1px solid rgba(255,255,255,0.08)',flexShrink:0}}>
            <button onClick={() => setHistory([])}
              style={{width:'100%',padding:'11px 0',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',background:'transparent',borderRadius:12,fontSize:10,fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',cursor:'pointer',transition:'background .2s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              Limpiar historial
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const closeBtnStyle = {background:'none',border:'none',color:'rgba(255,255,255,0.6)',cursor:'pointer',padding:4,lineHeight:0,transition:'color .2s'};

function IconBtn({ onClick, children, badge, active, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{width:44,height:44,background:active?'rgba(99,102,241,0.45)':hover?'rgba(255,255,255,0.14)':'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.16)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',position:'relative',transition:'background .2s',flexShrink:0}}
    >
      {children}
      {badge && <span style={{position:'absolute',top:-4,right:-4,width:17,height:17,background:'#ef4444',borderRadius:'50%',fontSize:9,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>{badge>99?'99+':badge}</span>}
    </button>
  );
}