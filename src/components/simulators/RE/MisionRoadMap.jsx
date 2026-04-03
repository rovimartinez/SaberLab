'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/useAuth';
import { Lock, Zap, Box, Code2, List, Settings, CircleDot, Star, X } from 'lucide-react';
import ArduinoExercisesSimulator from './MisionLeccion';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const MisionRoadMap = ({ missions = [] }) => {
  const { user } = useAuth();
  const [progreso, setProgreso] = useState(missions.length || 0);
  const [mounted, setMounted] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  const userAvatar = user?.user_metadata?.avatar_url || user?.email?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setProgreso(missions.length || 0);
    setSelectedChallengeId(null);
  }, [missions]);

  const iconByType = {
    drag: <Zap size={24} />,
    write: <Code2 size={24} />
  };

  const rutaRetos = missions.map((mission, index) => {
    const parts = mission.title.split(':');
    const shortTitle = parts[0]?.trim() || `Mision ${index + 1}`;
    const shortDesc = parts.slice(1).join(':').trim() || mission.goal;

    return {
      id: index + 1,
      title: shortTitle,
      desc: shortDesc,
      type: mission.type === 'write' ? 'CODIGO' : 'BLOQUE',
      icon: iconByType[mission.type] || <CircleDot size={24} />,
      xp: 50 + (index * 30)
    };
  });

  const handleNodeClick = (retoId) => {
    const isLocked = retoId > progreso;
    if (!isLocked) {
      setSelectedChallengeId(retoId);
    }
  };

  const totalRetos = rutaRetos.length;
  const progressPercentage = totalRetos > 1 ? ((progreso - 1) / (totalRetos - 1)) * 100 : 0;
  
  const selectedChallenge = rutaRetos.find(r => r.id === selectedChallengeId);

  return (
    <>
      <style>{`
        .mision-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          border-radius: 16px;
          padding: 5rem 2rem 8rem;
          margin-top: 1rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255,255,255,0.1);
          min-height: 350px;
          overflow: hidden;
        }
        
        .mision-nodes-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
          position: relative;
          z-index: 10;
        }
        
        .mision-line-bg {
          position: absolute;
          left: 24px;
          right: 24px;
          height: 6px;
          top: 24px;
          pointer-events: none;
          z-index: 1;
        }
        
        .mision-line-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: var(--progress);
          background: linear-gradient(90deg, #10b981, #a855f6, #6366f1);
          border-radius: 4px;
          transition: all 1s ease-out;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }
        
        @keyframes float-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
        
        .avatar-anim-responsive {
          display: flex;
          align-items: center;
          flex-direction: column;
          animation: float 3s ease-in-out infinite;
        }
        
        .mision-node-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 48px;
          position: relative;
        }
        
        .mision-node-avatar {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translate(-50%, 0);
          z-index: 100;
          width: 40px;
          height: 40px;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mision-info-box {
          position: absolute;
          top: 64px;
          left: 50%;
          transform: translate(-50%, 0);
          text-align: center;
          width: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        
        .mision-info-box.hovered {
          transform: translate(-50%, 4px);
        }

        .mision-particle-cont {
          position: absolute;
          height: 100%;
          overflow: hidden;
          left: var(--particle-left);
          width: var(--particle-width);
        }

        .mision-particle-bg {
          width: 33%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.8), transparent);
          animation: energy-flow 1.5s linear infinite;
        }

        @media (max-width: 768px) {
          .mision-wrapper {
            padding: 32px 16px;
            align-items: stretch;
            min-height: auto;
          }
          .mision-nodes-container {
            flex-direction: column;
            gap: 2.5rem;
            width: 100%;
            padding-left: 140px; /* Desplazamos más el núcleo a la derecha */
          }
          .mision-line-bg {
            left: 161px; /* 140px cont-padding + 24px half-node - 3px half-line = 161px */
            top: 24px;
            bottom: 24px;
            right: auto;
            width: 6px;
            height: auto;
            z-index: -1;
          }
          .mision-line-fill {
            width: 100%;
            height: var(--progress);
            background: linear-gradient(180deg, #10b981, #a855f6, #6366f1);
          }
          .mision-node-item {
            flex-direction: row;
            align-items: center;
            width: 100%;
          }
          .mision-node-avatar {
            /* Forced fallback to override mobile weirdness */
            position: absolute !important; 
            top: 50% !important;
            bottom: auto !important;
            left: -56px !important; /* Lo halamos más a la izquierda para que NO se mueva tanto a la derecha */
            transform: translateY(-50%) scale(0.95) !important; /* Más grande y centrado verticalmente */
            margin: 0;
            z-index: 100;
          }
          .avatar-anim-responsive {
            flex-direction: row; /* Mantiene la flecha a la derecha en modo móvil */
            animation: float-horizontal 3s ease-in-out infinite; /* Flotamiento Izquierda/Derecha en móvil */
          }
          .mision-info-box {
            position: static;
            transform: none !important;
            text-align: left;
            width: calc(100% - 64px);
            align-items: flex-start;
            margin-left: 16px;
          }
          .mision-info-box p:first-child {
            font-size: 11px !important;
            margin-bottom: 2px !important;
          }
          .mision-info-box p:nth-child(2) {
            font-size: 10px !important;
            max-width: 100% !important;
            margin-bottom: 4px !important;
          }
          .mision-particle-cont {
            top: var(--particle-left);
            height: var(--particle-width);
            left: 0;
            width: 100%;
          }
          .mision-particle-bg {
            height: 33%;
            width: 100%;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent);
          }
          .mobile-arrow { display: block !important; }
          .pc-arrow { display: none !important; }
        }
        
        @media (min-width: 769px) {
          .mision-node-avatar {
            position: absolute;
            top: -46px; /* Ajuste preciso hacia arriba para no tapar el nodo en PC */
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
          }
          .mobile-arrow { display: none !important; }
          .pc-arrow { display: block !important; }
        }
      `}</style>
      <div 
        className="mision-wrapper" 
        style={{ 
          "--progress": `${mounted ? progressPercentage : 0}%`, 
          "--particle-left": `${((progreso - 2) / (totalRetos - 1)) * 100}%`, 
          "--particle-width": `${(1 / (totalRetos - 1)) * 100}%` 
        }}
      >
      
      {/* Dynamic Lighting Layer */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          pointerEvents: 'none',
          transition: 'opacity 1s',
          opacity: 0.6,
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, hsla(262, 83%, 58%, 0.15), transparent 80%)`,
        }}
      />

      {/* Decorative Background */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: 0.1, 
        pointerEvents: 'none', 
        backgroundImage: 'radial-gradient(#a855f7 0.5px, transparent 0.5px)', 
        backgroundSize: '32px 32px' 
      }}></div>

      {rutaRetos.length === 0 && (
        <div style={{
          width: '100%',
          maxWidth: '720px',
          margin: '2rem auto',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.7)',
          color: '#cbd5e1',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          No hay misiones configuradas para esta leccion todavia.
        </div>
      )}

      {/* Main Container */}
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: '1000px', 
        marginTop: '1rem'
      }}>
        
        {/* Challenge Nodes */}
        <div className="mision-nodes-container">
          
          {/* Connection System - AHORA COMO HIJO */}
          {rutaRetos.length > 0 && (
          <div className="mision-line-bg">
            <div style={{ 
              position: 'absolute', 
              height: '100%', 
              width: '100%', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '4px'
            }}></div>
            
            <div className="mision-line-fill"></div>

            {/* Energy flow particle */}
            {progreso > 1 && (
              <div className="mision-particle-cont">
                <div className="mision-particle-bg"></div>
              </div>
            )}
          </div>
          )}
          {rutaRetos.map((reto, index) => {
            const isCompleted = index + 1 < progreso;
            const isCurrent = index + 1 === progreso;
            const isLocked = index + 1 > progreso;

            return (
              <div 
                key={reto.id} 
                className="mision-node-item"
                style={{ cursor: !isLocked ? 'pointer' : 'not-allowed' }}
                onMouseEnter={() => setHoveredId(reto.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleNodeClick(reto.id)}
              >
                
                {/* Visual Node Container (48x48) */}
                <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                    
                  {/* User Avatar for current challenge */}
                  {isCurrent && (
                    <div className="mision-node-avatar">
                      <div className="avatar-anim-responsive">
                        <div style={{ position: 'relative', padding: '2px', borderRadius: '50%', background: 'linear-gradient(to right, rgba(168, 85, 247, 0.7), #a855f7)', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', color: 'white', overflow: 'hidden', boxShadow: '0 0 15px rgba(59, 130, 246, 0.8), inset 0 0 8px rgba(59, 130, 246, 0.4)' }}>
                             {userAvatar.startsWith('http') ? <img src={userAvatar} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : userAvatar}
                          </div>
                        </div>
                        <div className="mobile-arrow" style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '6px solid #a855f7', marginLeft: '-2px' }}></div>
                        {/* PC Arrow (Hidden by default) */}
                        <div className="pc-arrow" style={{ display: 'none', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #a855f7', marginTop: '-2px' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Rectangular Node */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      border: '2px solid',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.5s ease',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      background: isCompleted ? '#1e293b' : isCurrent ? '#a855f7' : isLocked ? '#334155' : 'rgba(15, 23, 42, 0.8)',
                      borderColor: isCompleted ? '#10b981' : isCurrent ? '#ffffff' : isLocked ? '#64748b' : 'rgba(255,255,255,0.05)',
                      opacity: 1,
                      transform: isCurrent ? 'scale(1)' : 'scale(1)',
                      boxShadow: isCurrent ? '0 0 20px rgba(168, 85, 247, 0.4)' : isCompleted ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
                      zIndex: 10 // Bajo el avatar
                    }}
                  >
                    {isCurrent && (
                      <div style={{ 
                        position: 'absolute', 
                        inset: '-3px', 
                        borderRadius: '18px', 
                        border: '2px solid rgba(168, 85, 247, 0.8)',
                        animation: 'rect-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        opacity: 0
                      }}></div>
                    )}

                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      transition: 'opacity 0.3s', 
                      opacity: hoveredId === reto.id ? 1 : 0,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), transparent)'
                    }}></div>

                    <div style={{ 
                      transition: 'all 0.3s ease', 
                      transform: hoveredId === reto.id ? 'scale(1.05)' : 'scale(1)',
                      color: isLocked ? '#94a3b8' : isCompleted ? '#10b981' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%'
                    }}>
                      {isLocked ? (
                        <Lock size={20} />
                      ) : isCompleted ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <div style={{ 
                          color: isCurrent ? 'white' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {React.cloneElement(reto.icon, { size: 20 })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Node Pulse Effect */}
                  {isCurrent && (
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: 'rgba(168, 85, 247, 0.1)', 
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      transform: 'scale(1.3)', 
                      zIndex: -10,
                      filter: 'blur(15px)'
                    }}></div>
                  )}
                </div> {/* End Visual Node Container */}

                {/* Challenge Info */}
                <div className={`mision-info-box ${hoveredId === reto.id ? 'hovered' : ''}`}>
                    <p style={{ 
                      fontSize: '9px', 
                      fontWeight: 900, 
                      letterSpacing: '0.1em', 
                      textTransform: 'uppercase',
                      color: isLocked ? 'rgba(148, 163, 184, 0.4)' : isCurrent ? '#a855f7' : isCompleted ? 'rgba(16, 185, 129, 0.8)' : '#94a3b8',
                      marginBottom: '0',
                      lineHeight: '1.2'
                    }}>
                      {reto.title}
                    </p>
                    <p style={{ 
                      fontSize: '8px', 
                      fontWeight: 400, 
                      color: isLocked ? 'rgba(148, 163, 184, 0.2)' : '#cbd5e1',
                      marginBottom: '0.5rem',
                      maxWidth: '100px',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      lineHeight: '1.4'
                    }}>
                      {reto.desc}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: isLocked ? 0.3 : 0.8 }}>
                      <Star 
                        size={12} 
                        style={{
                          color: isLocked ? 'rgba(148, 163, 184, 0.2)' : '#fbbf24',
                          fill: !isLocked ? '#fbbf24' : 'none',
                          filter: !isLocked ? 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))' : 'none'
                        }}
                      />
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        color: isLocked ? 'rgba(148, 163, 184, 0.2)' : '#fde047',
                        textShadow: !isLocked ? '0 0 5px rgba(250, 204, 21, 0.3)' : 'none'
                      }}>
                        {reto.xp} XP
                      </span>
                    </div>
                  </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Detail Modal (Inline) */}
      {selectedChallenge && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out',
          padding: '2rem'
        }}
        onClick={() => setSelectedChallengeId(null)}
        >
          <div style={{
            background: '#0f172a',
            borderRadius: '12px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            width: '100%',
            maxWidth: '1400px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '0.6rem 1.2rem', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', background: 'rgba(168, 85, 247, 0.1)', position: 'relative' }}>
               <div style={{ width: '40px' }}></div> {/* Espaciador para equilibrar la X */}
               <div style={{ flex: 1, textAlign: 'center' }}>
                 <h3 style={{ color: '#a855f7', fontSize: '1rem', fontWeight: 800, margin: 0 }}>{selectedChallenge.title}</h3>
               </div>
               <button onClick={() => setSelectedChallengeId(null)} style={{ background: 'transparent', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <X size={20} />
               </button>
            </div>
            
            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '0' }}>
               <ArduinoExercisesSimulator challengesData={missions} initialChallengeId={selectedChallengeId - 1} onClose={() => setSelectedChallengeId(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default MisionRoadMap;

