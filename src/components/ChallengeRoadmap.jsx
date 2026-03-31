import React, { useState } from 'react';
import { Zap, Box, Code2, Settings, ListChecks, CircleDot, Lock, CheckCircle, Trophy, ArrowLeft } from 'lucide-react';
import CodeEditor from './CodeEditor';

const ChallengeRoadmap = () => {
    const [activeChallenge, setActiveChallenge] = useState(0);
    const [showEditor, setShowEditor] = useState(false);

    const challenges = [
        {
            id: 1,
            title: "Mi Primer LED",
            xp: 50,
            icon: <Zap size={24} />,
            status: "completed",
            description: "Controla el LED integrado (Pin 13) para que parpadee.",
            code: "void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}"
        },
        {
            id: 2,
            title: "Semáforo Básico",
            xp: 80,
            icon: <ListChecks size={24} />,
            status: "current",
            description: "Crea un semáforo con LED Rojo, Amarillo y Verde.",
            code: "// Define los pines\nconst int red = 10;\nconst int yellow = 9;\nconst int green = 8;\n\nvoid setup() {\n  pinMode(red, OUTPUT);\n  pinMode(yellow, OUTPUT);\n  pinMode(green, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(red, HIGH);\n  delay(3000);\n  digitalWrite(red, LOW);\n  \n  digitalWrite(green, HIGH);\n  delay(3000);\n  digitalWrite(green, LOW);\n}"
        },
        {
            id: 3,
            title: "Secuencia de Luces",
            xp: 100,
            icon: <Code2 size={24} />,
            status: "locked",
            description: "Programa una secuencia de luces tipo 'caballo' (Knight Rider).",
            code: "// Define los pines (pines 2 a 5)\nvoid setup() {\n  for(int i=2; i<=5; i++) {\n    pinMode(i, OUTPUT);\n  }\n}\n\nvoid loop() {\n  // Código de secuenciación\n}"
        },
        {
            id: 4,
            title: "Control de Brillo",
            xp: 120,
            icon: <Settings size={24} />,
            status: "locked",
            description: "Usa PWM para variar el brillo de un LED con analogWrite().",
            code: "void loop() {\n  // Aumentar brillo\n  for(int i=0; i<255; i++) {\n    analogWrite(9, i);\n    delay(10);\n  }\n}"
        },
        {
            id: 5,
            title: "Patrones Rítmicos",
            xp: 150,
            icon: <Box size={24} />,
            status: "locked",
            description: "Crea patrones de parpadeo con diferentes intervalos usando millis().",
            code: "unsigned long anterior = 0;\n\nvoid loop() {\n  unsigned long ahora = millis();\n  if (ahora - anterior >= 1000) {\n    // Toggle LED\n    anterior = ahora;\n  }\n}"
        },
        {
            id: 6,
            title: "Proyecto Final",
            xp: 200,
            icon: <CircleDot size={24} />,
            status: "locked",
            description: "Diseña tu propio proyecto integrando todo lo aprendido.",
            code: "// ¡Es tu momento de crear!\n// Implementa tu propio diseño aquí"
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'current': return '#a855f7';
            case 'locked': return '#64748b';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            {showEditor ? (
                <div>
                    <button 
                        onClick={() => setShowEditor(false)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            color: '#a855f7', 
                            background: 'none', 
                            border: 'none', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            marginBottom: '1.5rem',
                            fontSize: '1rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        Volver al Roadmap
                    </button>
                    <CodeEditor initialCode={challenges[activeChallenge].code} />
                </div>
            ) : (
                <>
            <h3 style={{ color: '#a855f7', fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={28} className="text-yellow-500" style={{ color: '#fbbf24' }} />
                Roadmap de Desafíos
            </h3>

            {/* Roadmap Display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', padding: '0 1rem', position: 'relative' }}>
                {/* Progress Line Background */}
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '40px', 
                    right: '40px', 
                    height: '4px', 
                    background: '#334155', 
                    zIndex: 0,
                    transform: 'translateY(-50%)',
                    borderRadius: '4px'
                }} />

                {/* Active Progress Line */}
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '40px', 
                    width: '40%', 
                    height: '4px', 
                    background: 'linear-gradient(90deg, #10b981, #a855f7)', 
                    zIndex: 1,
                    transform: 'translateY(-50%)',
                    borderRadius: '4px'
                }} />

                {challenges.map((challenge, index) => {
                    const isActive = challenge.status === 'current';
                    const isCompleted = challenge.status === 'completed';
                    
                    return (
                        <div key={challenge.id} style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveChallenge(index)}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: isActive ? '#a855f7' : (isCompleted ? '#10b981' : '#1e293b'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `3px solid ${getStatusColor(challenge.status)}`,
                                boxShadow: isActive ? '0 0 20px rgba(168, 85, 247, 0.5)' : 'none',
                                transition: 'all 0.3s ease',
                                marginBottom: '0.5rem'
                            }}>
                                {isCompleted ? <CheckCircle size={24} color="white" /> : 
                                 challenge.status === 'locked' ? <Lock size={20} color="#94a3b8" /> : 
                                 challenge.icon}
                            </div>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                color: isActive ? '#a855f7' : '#94a3b8',
                                textAlign: 'center'
                            }}>{challenge.xp} XP</span>
                        </div>
                    );
                })}
            </div>

            {/* Challenge Details Card */}
            <div style={{ 
                background: 'rgba(30, 41, 59, 0.6)', 
                borderRadius: '24px', 
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            {challenges[activeChallenge].id}. {challenges[activeChallenge].title}
                        </h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            {challenges[activeChallenge].description}
                        </p>
                    </div>
                    <div style={{ 
                        background: 'rgba(168, 85, 247, 0.1)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '12px',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                        <span style={{ color: '#a855f7', fontWeight: 900, fontSize: '1.1rem' }}>
                            +{challenges[activeChallenge].xp} XP
                        </span>
                    </div>
                </div>

                <div style={{ 
                    background: '#0f172a', 
                    borderRadius: '16px', 
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.85rem',
                    color: '#e2e8f0',
                    overflowX: 'auto'
                }}>
                    <pre style={{ margin: 0 }}>
                        <code style={{ color: '#e2e8f0' }}>
                            {challenges[activeChallenge].code}
                        </code>
                    </pre>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setShowEditor(true)}
                        style={{ 
                        background: '#a855f7', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.8rem 1.5rem', 
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Code2 size={18} />
                        Abrir en Simulador
                    </button>
                    <button style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '0.8rem 1.5rem', 
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}>
                        Ver Hint
                    </button>
                </div>
            </div>
                </>
            )}
        </div>
    );
};

export default ChallengeRoadmap;