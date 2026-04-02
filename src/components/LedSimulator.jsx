import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const LedSimulator = () => {
  const [isBlinking, setIsBlinking] = useState(false); 
  const [ledColor, setLedColor] = useState({ 
    main: '#ff4444', 
    dark: '#3a0808', 
    glow: '#ff4444',
    name: 'Rojo'
  });
  
  const [tick, setTick] = useState(false);

  useEffect(() => {
    let interval;
    if (isBlinking) {
      interval = setInterval(() => {
        setTick((prev) => !prev);
      }, 500);
    } else {
      setTick(false);
    }
    return () => clearInterval(interval);
  }, [isBlinking]);

  const colors = [
    { main: '#ff4444', dark: '#3a0808', glow: '#ff4444', name: 'Rojo' },
    { main: '#fbbf24', dark: '#423204', glow: '#fbbf24', name: 'Amarillo' },
    { main: '#4ade80', dark: '#062d16', glow: '#4ade80', name: 'Verde' },
    { main: '#3b82f6', dark: '#081c3e', glow: '#3b82f6', name: 'Azul' },
    { main: '#a855f7', dark: '#280d42', glow: '#a855f7', name: 'Púrpura' }
  ];

  const isLightOn = tick && isBlinking;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      fontFamily: 'system-ui, sans-serif'
    }}>
      
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: '260px',
        background: '#0d1117',
        borderRadius: '24px',
        border: '1px solid #30363d',
        padding: '20px',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        
        <div style={{
          position: 'absolute',
          left: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 20
        }}>
          {colors.map((c, i) => (
            <button
              key={i}
              onClick={() => { setLedColor(c); setIsBlinking(false); setTick(false); }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: ledColor.main === c.main ? '2px solid white' : '2px solid transparent',
                backgroundColor: c.main,
                cursor: 'pointer',
                transition: 'all 0.3s',
                transform: ledColor.main === c.main ? 'scale(1.25)' : 'scale(1)',
                opacity: ledColor.main === c.main ? 1 : 0.3,
                boxShadow: ledColor.main === c.main ? '0 0 15px rgba(255,255,255,0.4)' : 'none'
              }}
            />
          ))}
        </div>

        <svg viewBox="0 0 160 200" style={{ width: '100%', maxWidth: '160px', position: 'relative', zIndex: 10, marginLeft: '12px' }}>
          <defs>
            <linearGradient id="ledGradNew" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={ledColor.dark} />
              <stop offset="50%" stopColor={ledColor.main} />
              <stop offset="100%" stopColor={ledColor.dark} />
            </linearGradient>
            <linearGradient id="metalNew" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b949e" />
              <stop offset="50%" stopColor="#f0f6fc" />
              <stop offset="100%" stopColor="#484f58" />
            </linearGradient>
            <filter id="pieceNeonNew" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feGaussianBlur stdDeviation="12" result="softBlur"/>
              <feMerge>
                <feMergeNode in="softBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.8">
            <rect x="72" y="98" width="3" height="100" fill="url(#metalNew)" rx="1" />
            <rect x="85" y="98" width="3" height="42" fill="url(#metalNew)" rx="1" />
          </g>

          <g transform="translate(81, 140)">
            <rect x="4" y="30" width="3" height="30" fill="url(#metalNew)" />
            <rect x="0" y="0" width="11" height="30" rx="3" fill="#d1d5db" />
            <rect x="0" y="5" width="11" height="3" fill="#f97316" />
            <rect x="0" y="11" width="11" height="3" fill="#f97316" />
            <rect x="0" y="17" width="11" height="3" fill="#78350f" />
            <rect x="0" y="24" width="11" height="2" fill="#d4af37" />
          </g>

          <g>
            <path 
              d="M65,100 L65,62 A18,20 0 0,1 95,62 L95,100 Z" 
              fill={isLightOn ? ledColor.main : "url(#ledGradNew)"} 
              fillOpacity={isLightOn ? 1 : 0.6}
              filter={isLightOn ? "url(#pieceNeonNew)" : "none"}
            />
            <g opacity={isLightOn ? 0 : 0.35}>
              <path d="M72,98 L72,78 L76,78 L76,98 Z" fill={ledColor.dark} />
              <path d="M85,98 L85,76 L80,76 L78,72 L88,72 L88,98 Z" fill={ledColor.dark} />
            </g>
            <rect 
              x="63" y="100" width="34" height="5" rx="1.5" 
              fill={isLightOn ? ledColor.main : "url(#ledGradNew)"} 
              fillOpacity={isLightOn ? 1 : 0.7} 
            />
            {!isLightOn && (
              <path d="M70,66 A10,10 0 0,1 80,58" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.2" />
            )}
          </g>
        </svg>

        <div style={{
          position: 'absolute',
          right: '32px',
          bottom: '80px',
          background: 'rgba(28, 33, 40, 0.8)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #30363d',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <span style={{ color: '#f97316', fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>330 Ω</span>
        </div>
      </div>

      <button
        onClick={() => setIsBlinking(!isBlinking)}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '10px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          border: isBlinking ? '2px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(16, 185, 129, 0.3)',
          background: isBlinking ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: isBlinking ? '#ef4444' : '#10b981',
          cursor: 'pointer',
          transition: 'all 0.3s',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}
      >
        {isBlinking ? <Pause size={18} /> : <Play size={18} />}
        {isBlinking ? 'Detener Blink' : 'Iniciar Blink'}
      </button>
    </div>
  );
};

export default LedSimulator;
