'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { Lock, Zap, Box, Code2, List, Settings, CircleDot, Star, X } from 'lucide-react';
import ArduinoExercisesSimulator from './MisionLeccion';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ChallengeRoadmap = () => {
  const { user } = useAuth();
  const [progreso, setProgreso] = useState(6); // Habilitado para probar las 6 misiones
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

  const rutaRetos = [
    { id: 1, title: "Misión 1", icon: <Zap size={24} />, xp: 50 },
    { id: 2, title: "Misión 2", icon: <Code2 size={24} />, xp: 80 },
    { id: 3, title: "Misión 3", icon: <Settings size={24} />, xp: 100 },
    { id: 4, title: "Misión 4", icon: <List size={24} />, xp: 120 },
    { id: 5, title: "Misión 5", icon: <Box size={24} />, xp: 150 },
    { id: 6, title: "Misión 6", icon: <CircleDot size={24} />, xp: 200 }
  ];

  const handleNodeClick = (retoId) => {
    const isLocked = retoId > progreso;
    if (!isLocked) {
      setSelectedChallengeId(retoId);
    }
  };

  const totalRetos = rutaRetos.length;
  const progressPercentage = ((progreso - 1) / (totalRetos - 1)) * 100;
  
  const selectedChallenge = rutaRetos.find(r => r.id === selectedChallengeId);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      borderRadius: '16px', 
      padding: '2.5rem 1rem 1.5rem', 
      overflow: 'hidden',
      marginTop: '1rem',
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      
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

      {/* Main Container */}
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: '900px', 
        marginTop: '1rem'
      }}>
        
        {/* Connection System - Ahora dentro del contenedor de nodos para mejor alineación */}
        <div style={{ 
          position: 'absolute', 
          left: '24px', /* Mitad del ancho del nodo (48px / 2) */
          right: '24px', /* Mitad del ancho del último nodo */
          height: '6px', 
          top: '24px', /* Centro del nodo de 48px */
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <div style={{ 
            position: 'absolute', 
            height: '100%', 
            width: '100%', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '4px'
          }}></div>
          
          <div 
            style={{ 
              position: 'absolute', 
              height: '100%', 
              background: 'linear-gradient(90deg, #10b981, #a855f6, #6366f1)', 
              borderRadius: '4px', 
              transition: 'all 1s ease-out',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
              left: 0, 
              width: mounted ? `${progressPercentage}%` : '0%' 
            }}
          ></div>

          {/* Energy flow particle */}
          {progreso > 1 && (
            <div 
              style={{ 
                position: 'absolute', 
                height: '100%', 
                overflow: 'hidden',
                left: `${((progreso - 2) / (totalRetos - 1)) * 100}%`,
                width: `${(1 / (totalRetos - 1)) * 100}%`
              }}
            >
              <div style={{ 
                width: '33%', 
                height: '100%', 
                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.8), transparent)',
                animation: 'energy-flow 1.5s linear infinite'
              }}></div>
            </div>
          )}
        </div>

        {/* Challenge Nodes */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          position: 'relative', 
          zIndex: 10 
        }}>
          {rutaRetos.map((reto, index) => {
            const isCompleted = index + 1 < progreso;
            const isCurrent = index + 1 === progreso;
            const isLocked = index + 1 > progreso;

            return (
              <div key={reto.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: !isLocked ? 'pointer' : 'not-allowed'
                  }}
                  onMouseEnter={() => setHoveredId(reto.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleNodeClick(reto.id)}
                >
                  
                  {/* User Avatar for current challenge */}
                  {isCurrent && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '-38px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      zIndex: 30,
                      animation: 'float 3s ease-in-out infinite'
                    }}>
                      <div style={{ 
                        position: 'relative', 
                        padding: '2px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.7), #a855f7)',
                        boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
                      }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: '#1e293b', 
                          border: '2px solid #0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          color: 'white',
                          overflow: 'hidden'
                        }}>
                           {userAvatar.startsWith('http') ? <img src={userAvatar} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : userAvatar}
                        </div>
                        <div style={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          right: 0, 
                          width: '10px', 
                          height: '10px', 
                          background: '#10b981', 
                          border: '2px solid #0f172a', 
                          borderRadius: '50%'
                        }}></div>
                      </div>
                      <div style={{ 
                        width: 0, 
                        height: 0, 
                        borderLeft: '6px solid transparent', 
                        borderRight: '6px solid transparent', 
                        borderTop: '6px solid #a855f7', 
                        marginTop: '4px'
                      }}></div>
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
                      position: 'relative',
                      background: isCompleted ? '#1e293b' : isCurrent ? '#a855f7' : isLocked ? '#334155' : 'rgba(15, 23, 42, 0.8)',
                      borderColor: isCompleted ? '#10b981' : isCurrent ? '#ffffff' : isLocked ? '#64748b' : 'rgba(255,255,255,0.05)',
                      opacity: 1,
                      transform: isCurrent ? 'scale(1)' : 'scale(1)',
                      boxShadow: isCurrent ? '0 0 20px rgba(168, 85, 247, 0.4)' : isCompleted ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
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

                  {/* Challenge Info */}
                  <div style={{ 
                    marginTop: '1rem', 
                    textAlign: 'center', 
                    transform: hoveredId === reto.id ? 'translateY(4px)' : 'translateY(0)',
                    transition: 'all 0.3s ease'
                  }}>
                    <p style={{ 
                      fontSize: '10px', 
                      fontWeight: 900, 
                      letterSpacing: '0.25em', 
                      textTransform: 'uppercase',
                      color: isLocked ? 'rgba(148, 163, 184, 0.4)' : isCurrent ? '#a855f7' : isCompleted ? 'rgba(16, 185, 129, 0.8)' : '#94a3b8',
                      marginBottom: '0.25rem'
                    }}>
                      {reto.title}
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
            borderRadius: '24px',
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
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(168, 85, 247, 0.1)' }}>
               <div>
                 <h3 style={{ color: '#a855f7', fontSize: '1.25rem', fontWeight: 800 }}>{selectedChallenge.title}</h3>
               </div>
               <button onClick={() => setSelectedChallengeId(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#a855f7', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <X size={24} />
               </button>
            </div>
            
            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '0' }}>
               <ArduinoExercisesSimulator initialChallengeId={selectedChallengeId - 1} onClose={() => setSelectedChallengeId(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeRoadmap;