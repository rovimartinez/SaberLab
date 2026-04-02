import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle, 
    FileText, 
    PlayCircle, 
    BookOpen, 
    RefreshCw, 
    Wrench, 
    ClipboardList, 
    PenTool, 
    Monitor, 
    ChevronRight,
    Search,
    X,
    Clock,
    Trophy,
    AlertCircle,
    Check,
    Bot,
    Zap,
    Code,
    FlaskConical,
    Box,
    Brain,
    Cpu,
    Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import './Lesson.css';
import ChallengeRoadmap from '../components/ChallengeRoadmap';
import CodeEditor from '../components/CodeEditor';
import ArduinoSimulatorV2 from '../components/ArduinoSimulatorV2';
import LedSimulator from '../components/LedSimulator';
import { getCourseByAbbr, getLessonContent, getLessonInfo, getFullLessonPath, getCourseByIdentifier, COURSES_DEFINITION } from '../data/coursesData.jsx';

const tabs = [
    { id: 'contenido', label: 'Contenido', icon: <BookOpen size={18} /> },
    { id: 'repaso', label: 'Repaso', icon: <Brain size={18} /> },
    { id: 'simulador', label: 'Simulador', icon: <Cpu size={18} /> },
    { id: 'prueba', label: 'Prueba', icon: <ClipboardList size={18} /> }
];

const ArduinoSimulator = () => {
    const [isOn, setIsOn] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsOn(prev => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const pcbStyles = {
        teal: '#008184',
        metal: 'linear-gradient(180deg, #e5e7eb 0%, #bdc3c7 50%, #95a5a6 100%)',
    };

    return (
        <div className="arduino-simulator-wrapper" style={{ flex: 1.2, minWidth: '320px', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="arduino-pcb-final" style={{
                backgroundColor: pcbStyles.teal, width: '310px', height: '230px', borderRadius: '4px', position: 'relative',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                clipPath: 'polygon(0% 10px, 10px 0%, 98% 0%, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0% 98%, 0% 75%, 5px 72%, 5px 35%, 0% 32%)'
            }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '24px', height: '24px', background: '#bdc3c7', borderRadius: '2px', display: 'flex', zIndex: 10 }}>
                    <div style={{ width: '14px', height: '14px', margin: 'auto', background: 'radial-gradient(circle, #e74c3c, #c0392b)', borderRadius: '50%' }}></div>
                </div>
                <div style={{ position: 'absolute', left: '0px', top: '40px', width: '50px', height: '45px', background: pcbStyles.metal, borderRadius: '1px', border: '1px solid #7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '25px', height: '30px', background: '#1a1a1a', borderRadius: '1px' }}></div>
                </div>
                <div style={{ position: 'absolute', left: '0px', bottom: '25px', width: '55px', height: '40px', background: 'linear-gradient(180deg, #111 0%, #333 50%, #000 100%)', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', top: '5px', right: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(10)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(8)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: '75px', right: '35px', width: '160px', height: '35px', background: '#1a1a1a', borderRadius: '1px', boxShadow: '0 10px 20px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px', color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>
                    ATMEGA328P-PU
                </div>
                <div style={{ position: 'absolute', top: '80px', right: '110px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '7px', height: '6px', background: isOn ? '#fbbf24' : '#333', boxShadow: isOn ? '0 0 12px #fbbf24' : 'none', transition: 'all 0.1s' }}></div>
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 900 }}>L</span>
                </div>
                <div style={{ position: 'absolute', top: '100px', right: '110px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '7px', height: '6px', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71' }}></div>
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 900 }}>ON</span>
                </div>
            </div>
        </div>
    );
};

const ReviewSection = ({ user, lessonKey, flashcards = [] }) => {
    const [flipped, setFlipped] = useState({});
    const [mastered, setMastered] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && lessonKey) {
            loadProgress();
        }
    }, [user, lessonKey]);

    const loadProgress = async () => {
        try {
            setLoading(true);
            const { data } = await supabase
                .from('student_flashcards')
                .select('card_id, status')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonKey);
            
            if (data) {
                const progress = {};
                data.forEach(item => {
                    progress[item.card_id] = item.status;
                });
                setMastered(progress);
            }
        } catch (err) {
            console.error("Error loading progress:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlip = (id) => {
        setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleMark = async (e, id, status) => {
        e.stopPropagation();
        setMastered(prev => ({ ...prev, [id]: status }));
        if (user && lessonKey) {
            try {
                await supabase.from('student_flashcards').upsert({
                    user_id: user.id,
                    lesson_id: lessonKey,
                    card_id: id,
                    status: status,
                    updated_at: new Date()
                }, { onConflict: 'user_id, lesson_id, card_id' });
            } catch (err) {
                console.error("Error saving progress:", err);
            }
        }
        setTimeout(() => setFlipped(prev => ({ ...prev, [id]: false })), 800);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#a855f7' }}><RefreshCw className="animate-spin" size={32} /></div>;

    return (
        <div className="review-section-interactive" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
                {flashcards.map(card => {
                    const status = mastered[card.id];
                    let accentColor = card.type === 'hw' ? '#a855f7' : '#60a5fa';
                    let cardBg = 'rgba(30, 41, 59, 0.6)';
                    let glow = 'none';
                    
                    if (status === 'known') {
                        accentColor = '#10b981';
                        cardBg = 'rgba(16, 185, 129, 0.15)';
                        glow = '0 0 20px rgba(16, 185, 129, 0.2)';
                    } else if (status === 'unknown') {
                        accentColor = '#ef4444';
                        cardBg = 'rgba(239, 68, 68, 0.15)';
                        glow = '0 0 20px rgba(239, 68, 68, 0.2)';
                    }

                    return (
                        <div 
                            key={card.id} 
                            className={`memory-card ${flipped[card.id] ? 'is-flipped' : ''}`} 
                            onClick={() => toggleFlip(card.id)}
                            style={{ height: '230px', perspective: '1000px', cursor: 'pointer' }}
                        >
                            <div className="card-inner" style={{ 
                                position: 'relative', 
                                width: '100%', 
                                height: '100%', 
                                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)', 
                                transformStyle: 'preserve-3d'
                            }}>
                                <div className="card-front" style={{ 
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
                                    background: cardBg, border: `2px solid ${accentColor}`, borderRadius: '24px', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                    padding: '2rem', textAlign: 'center', boxShadow: glow, backdropFilter: 'blur(10px)',
                                    transition: 'all 0.4s ease'
                                }}>
                                    <div style={{ 
                                        background: `${accentColor}15`, 
                                        padding: '14px', borderRadius: '18px', marginBottom: '16px',
                                        border: `1px solid ${accentColor}30`,
                                        transition: 'all 0.4s ease'
                                    }}>
                                        {card.type === 'hw' ? <PenTool size={26} color={accentColor} /> : <Code size={26} color={accentColor} />}
                                    </div>
                                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.4 }}>{card.q}</span>
                                    <div style={{ marginTop: '1.25rem', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>Toca para ver respuesta</div>
                                </div>
                                <div className="card-back" style={{ 
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
                                    background: 'rgba(15, 23, 42, 0.98)', border: `3px solid ${accentColor}`, borderRadius: '24px', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                    padding: '2rem', textAlign: 'center', transform: 'rotateY(180deg)', 
                                    boxShadow: `0 20px 40px rgba(0,0,0,0.5), ${glow}`, transition: 'all 0.4s ease'
                                }}>
                                    <span style={{ 
                                        color: accentColor, fontWeight: 900, fontSize: '1.5rem', marginBottom: '14px', 
                                        textShadow: `0 0 20px ${accentColor}60`, letterSpacing: '0.5px' 
                                    }}>{card.a}</span>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.6, fontWeight: 500 }}>{card.sub}</p>
                                    <div style={{ display: 'flex', gap: '14px' }}>
                                        <button 
                                            onClick={(e) => handleMark(e, card.id, 'known')} 
                                            style={{ width: '44px', height: '44px', borderRadius: '14px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)' }} 
                                            onMouseOver={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.filter='brightness(1.1)'; }} 
                                            onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='brightness(1)'; }}
                                        ><Check size={22} strokeWidth={4} /></button>
                                        <button 
                                            onClick={(e) => handleMark(e, card.id, 'unknown')} 
                                            style={{ width: '44px', height: '44px', borderRadius: '14px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)' }} 
                                            onMouseOver={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.filter='brightness(1.1)'; }} 
                                            onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='brightness(1)'; }}
                                        ><X size={22} strokeWidth={4} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MiniChallengeSimulator = ({ challengeIdx, onClose }) => {
    const [leds, setLeds] = useState({ 
        r: false, y: false, g: false, blue: false, 
        s1: false, s2: false, s3: false, s4: false, s5: false 
    });
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        let isActive = true;
        let currentTimeout;

        const wait = (ms) => new Promise(res => {
            currentTimeout = setTimeout(res, ms);
        });

        const waitWithCountdown = async (seconds) => {
            for (let i = seconds; i > 0; i--) {
                if (!isActive) return;
                setTimeLeft(i);
                await wait(1000);
            }
        };

        const runSequence = async () => {
            while (isActive) {
                if (challengeIdx === 0) {
                    setLeds({ r: true, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(200);
                    if (!isActive) break;
                    setLeds({ r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(200);
                } else if (challengeIdx === 1) {
                    const deat = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                    const punto = 200, raya = 600;
                    for(let i=0; i<3; i++) {
                        setLeds({...deat, r: true}); await wait(punto); if(!isActive) break;
                        setLeds(deat); await wait(punto); if(!isActive) break;
                    }
                    if(!isActive) break;
                    await wait(600);
                    for(let i=0; i<3; i++) {
                        setLeds({...deat, r: true}); await wait(raya); if(!isActive) break;
                        setLeds(deat); await wait(punto); if(!isActive) break;
                    }
                    if(!isActive) break;
                    await wait(600);
                    for(let i=0; i<3; i++) {
                        setLeds({...deat, r: true}); await wait(punto); if(!isActive) break;
                        setLeds(deat); await wait(punto); if(!isActive) break;
                    }
                    if(!isActive) break;
                    await wait(2000);
                } else if (challengeIdx === 2) {
                    // Sirena Policial (Rojo / Azul) corregido
                    setLeds({ r: true, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(300);
                    if (!isActive) break;
                    setLeds({ r: false, y: false, g: false, blue: true, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(300);
                } else if (challengeIdx === 3) {
                    // Secuenciador (Barrido horizontal de 5 luces) a 200ms
                    const pins = ['s1', 's2', 's3', 's4', 's5'];
                    for (let p of pins) {
                        const state = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                        state[p] = true;
                        setLeds(state);
                        await wait(200);
                        if (!isActive) break;
                    }
                    for (let i = 3; i >= 1; i--) {
                        const state = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                        state[`s${i+1}`] = true;
                        setLeds(state);
                        await wait(200);
                        if (!isActive) break;
                    }
                } else if (challengeIdx === 4) {
                    // Semáforo de Tráfico
                    setLeds({ r: true, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(2000);
                    if (!isActive) break;
                    setLeds({ r: true, y: true, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(1000);
                    if (!isActive) break;
                    setLeds({ r: false, y: false, g: true, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(3000);
                    if (!isActive) break;
                    setLeds({ r: false, y: true, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(1000);
                }
                if (!isActive) break;
            }
        };

        runSequence();
        return () => {
            isActive = false;
            clearTimeout(currentTimeout);
        };
    }, [challengeIdx]);

    const LedBulb = ({ color, isOn, glowColor }) => (
        <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            opacity: isOn ? 1 : 0.15,
            background: color,
            boxShadow: isOn ? `0 0 25px 8px ${glowColor}` : 'inset 0 0 10px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)',
            transition: 'all 0.1s ease-in-out',
            margin: '0 auto'
        }}></div>
    );

    return (
        <div 
            style={{
                position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div style={{
                background: 'rgba(30, 41, 59, 0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '2.5rem 2rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
                maxWidth: '380px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.2rem', top: '1.2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={18} />
                </button>

                <h4 style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    Simulador del Reto
                </h4>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: challengeIdx === 4 ? '220px' : '150px'
                }}>
                    {challengeIdx === 2 ? (
                        <div style={{ 
                            background: 'linear-gradient(90deg, #111, #222)', 
                            padding: '24px 32px', 
                            borderRadius: '16px',
                            border: '3px solid #333',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.9)',
                            display: 'flex', 
                            gap: '24px' 
                        }}>
                            <LedBulb color="#3b82f6" glowColor="#3b82f6" isOn={leds.blue} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                        </div>
                    ) : challengeIdx === 3 ? (
                        <div style={{ 
                            background: '#111', 
                            padding: '16px 24px', 
                            borderRadius: '16px',
                            border: '3px solid #333',
                            display: 'flex', 
                            gap: '12px' 
                        }}>
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s1} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s2} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s3} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s4} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s5} />
                        </div>
                    ) : challengeIdx === 4 ? (
                        <div style={{ 
                            background: 'linear-gradient(180deg, #111, #222)', 
                            padding: '24px', 
                            borderRadius: '24px',
                            border: '3px solid #333',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.9)',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '16px' 
                        }}>
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                            <LedBulb color="#facc15" glowColor="#facc15" isOn={leds.y} />
                            <LedBulb color="#10b981" glowColor="#10b981" isOn={leds.g} />
                        </div>
                    ) : (
                        <div style={{
                            background: '#0f172a',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)',
                        }}>
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                        </div>
                    )}
                </div>
                
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
                    {challengeIdx === 0 && 'Parpadeo constante configurado a 200ms'}
                    {challengeIdx === 1 && 'Ciclo S.O.S reproduciendo (... --- ...)'}
                    {challengeIdx === 2 && 'Modo Persecución: Alternando Azul/Rojo'}
                    {challengeIdx === 3 && 'Modo Secuenciador: Barrido de 5 luces'}
                    {challengeIdx === 4 && 'Reto Maestro: Programación de Tráfico'}
                </p>
            </div>
        </div>
    );
};

const Lesson = () => {
    const { user } = useAuth();
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contenido');

    const courseData = getCourseByIdentifier(courseId);

    // Redirigir automáticamente al slug descriptivo si se entra por la abreviatura
    useEffect(() => {
        if (courseId && courseData && courseId !== courseData.slug) {
            navigate(`/dashboard/my-courses/${courseData.slug}/${moduleId}/${lessonId}`, { replace: true });
        }
    }, [courseId, courseData, moduleId, lessonId, navigate]);

    useEffect(() => {
        const loadLesson = async () => {
            setLoading(true);
            console.log('Loading lesson registry lookup...');
            try {
                // Fallback course data if lookup fails (e.g. missing slug)
                const courseFallback = { name: 'Robótica Educativa', color: '#a855f7', icon: <Bot />, abbr: 'RE' };
                const currentCourseData = courseData || COURSES_DEFINITION.find(c => c.slug === courseId || c.abbr.toLowerCase() === courseId.toLowerCase()) || courseFallback;
                
                const registryCourseId = currentCourseData ? currentCourseData.abbr.toLowerCase() : courseId.toLowerCase();
                const internalId = (lessonId && lessonId.includes('-')) ? lessonId : `${registryCourseId}-${moduleId.toLowerCase()}-${lessonId.toLowerCase()}`;
                
                const data = await getLessonContent(internalId);
                console.log('Lesson data:', data);
                setLesson(data);
            } catch (e) {
                console.error('Error loading lesson:', e);
            }
            setLoading(false);
        };
        loadLesson();
    }, [courseId, courseData, moduleId, lessonId]);

    const courseCode = courseData ? courseData.abbr.toLowerCase() : courseId.toLowerCase();
    const internalId = (lessonId && lessonId.includes('-')) ? lessonId : `${courseCode}-${moduleId.toLowerCase()}-${lessonId.toLowerCase()}`;
    const lessonPath = getFullLessonPath(internalId);
    const moduleInfo = (lessonPath && lessonPath.module) || { name: 'Módulo 1' };
    const courseInfoMeta = (lessonPath && lessonPath.lesson) || { title: 'Lección' };
    // If we can't find course info from registry (e.g. fallback for old links), default to RE
    const subject = (lessonPath && lessonPath.course) || { name: 'Robótica Educativa', color: '#a855f7', icon: <Bot />, abbr: 'RE' };
    const courseInfo = (lessonPath && lessonPath.lesson) || { title: 'Lección' };
    
    // Legacy support or generate a key
    const lessonKey = internalId;
    const [scrollProgress, setScrollProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef(null);
    const [quizMode, setQuizMode] = useState('intro');
    const [currentQ, setCurrentQ] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showGuide, setShowGuide] = useState(false);
    const [activeChallenge, setActiveChallenge] = useState(0);
    const [showSimulator, setShowSimulator] = useState(false);

    const quizQuestions = lesson?.questions || [];


    const startQuiz = () => {
        setQuizMode('question');
        setCurrentQ(0);
        setQuizScore(0);
        setTimeLeft(30);
        setSelectedAnswer(null);
    };

    const handleQuizAnswer = (optionIndex) => {
        if (selectedAnswer !== null) return;
        
        setSelectedAnswer(optionIndex);
        
        if (optionIndex !== -1 && optionIndex === quizQuestions[currentQ].correct) {
            setQuizScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQ < quizQuestions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setTimeLeft(30);
                setSelectedAnswer(null);
            } else {
                setQuizMode('result');
            }
        }, 1500);
    };

    useEffect(() => {
        if (quizMode === 'question' && timeLeft > 0 && selectedAnswer === null) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (quizMode === 'question' && timeLeft === 0 && selectedAnswer === null) {
            setSelectedAnswer(-1);
            setTimeout(() => {
                if (currentQ < quizQuestions.length - 1) {
                    setCurrentQ(prev => prev + 1);
                    setTimeLeft(30);
                    setSelectedAnswer(null);
                } else {
                    setQuizMode('result');
                }
            }, 1500);
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, quizMode, currentQ, selectedAnswer]);

    const handleScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        window.dispatchShowGuide = () => setShowGuide(true);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            delete window.dispatchShowGuide;
        };
    }, []);


    const GuideModal = () => {
        if (!showGuide) return null;
        
        const colors = [
            { name: 'Negro', v12: 0, mult: 'x1 Ω', tol: '-', color: '#000000' },
            { name: 'Marrón', v12: 1, mult: 'x10 Ω', tol: '±1%', color: '#92400f' },
            { name: 'Rojo', v12: 2, mult: 'x100 Ω', tol: '±2%', color: '#ef4444' },
            { name: 'Naranja', v12: 3, mult: 'x1k Ω', tol: '-', color: '#f59e0b' },
            { name: 'Amarillo', v12: 4, mult: 'x10k Ω', tol: '-', color: '#facc15' },
            { name: 'Verde', v12: 5, mult: 'x100k Ω', tol: '±0.5%', color: '#22c55e' },
            { name: 'Azul', v12: 6, mult: 'x1M Ω', tol: '±0.25%', color: '#3b82f6' },
            { name: 'Violeta', v12: 7, mult: 'x10M Ω', tol: '±0.1%', color: '#a855f7' },
            { name: 'Gris', v12: 8, mult: '-', tol: '±0.05%', color: '#64748b' },
            { name: 'Blanco', v12: 9, mult: '-', tol: '-', color: '#ffffff' },
            { name: 'Oro', v12: '-', mult: 'x0.1 Ω', tol: '±5%', color: '#fbbf24' },
            { name: 'Plata', v12: '-', mult: 'x0.01 Ω', tol: '±10%', color: '#94a3b8' },
        ];

        return (
            <div 
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out'
                }}
                onClick={() => setShowGuide(false)}
            >
                <div 
                    style={{
                        background: 'rgba(30, 41, 59, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px', width: '90%', maxWidth: '520px', padding: '1.25rem', position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={() => setShowGuide(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                    
                    <header style={{ marginBottom: '1rem' }}>
                        <h2 style={{ color: '#f97316', fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Search size={22} />
                            Guía de Colores (4 Bandas)
                        </h2>
                    </header>

                    <div style={{ overflowX: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                            <thead>
                                <tr style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'left' }}>Color</th>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'center' }}>B 1/2</th>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'center' }}>Mult.</th>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'right' }}>Tol.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {colors.map(c => (
                                    <tr key={c.name} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '0.4rem 0.75rem', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: c.color, border: '1px solid rgba(255,255,255,0.1)' }}></div>
                                            <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.8rem' }}>{c.name}</span>
                                        </td>
                                        <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', color: '#cbd5e1', fontWeight: 600, fontSize: '0.8rem' }}>{c.v12}</td>
                                        <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', color: '#f97316', fontWeight: 700, fontSize: '0.8rem' }}>{c.mult}</td>
                                        <td style={{ padding: '0.4rem 0.75rem', borderRadius: '0 8px 8px 0', textAlign: 'right', color: c.tol !== '-' ? '#10b981' : '#64748b', fontWeight: 800, fontSize: '0.8rem' }}>{c.tol}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="lesson-view-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Cargando lección...</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="lesson-view-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                    <p>Lección no encontrada</p>
                    <Link to="/dashboard" style={{ color: subject.color, marginTop: '1rem', display: 'inline-block' }}>Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="lesson-view-container animate-fade-in">
            <GuideModal />
            {/* Scroll Progress Bar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: `${scrollProgress}%`,
                height: '3px',
                background: `linear-gradient(to right, ${subject.color}, #ffffff)`,
                zIndex: 2000,
                transition: 'width 0.1s ease-out',
                boxShadow: `0 0 10px ${subject.color}`
            }} />

            {/* Premium Lesson Header */}
            <header className="lesson-header-premium">
                <div className="lesson-header-bg-icon">
                    {subject.icon}
                </div>

                <div className="lesson-header-main">
                    <div className="lesson-header-info">
                        <div className="lesson-breadcrumb">
                            <span>{subject.name}</span>
                            <ChevronRight size={12} className="breadcrumb-sep" />
                            <span>{moduleInfo.name}</span>
                            <ChevronRight size={12} className="breadcrumb-sep" />
                            <span style={{ color: subject.color }}>{lesson?.title || courseInfo.title}</span>
                        </div>
                        <h1>{lesson?.title || 'Cargando...'}</h1>
                    </div>

                    <Link to={`/dashboard/my-courses/${subject.slug}`} className="btn-back-course">
                        <ArrowLeft size={18} />
                        <span>Volver al curso</span>
                    </Link>
                </div>
            </header>

            {/* Premium Tabs System */}
            <nav className="lesson-tabs-wrapper">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`lesson-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="active-tab-indicator" style={{ background: subject.color }} />
                        )}
                    </button>
                ))}
            </nav>

            {/* Content Area */}
            <main className="lesson-content-card glass-panel">
                <article className="content-body">
                    {activeTab === 'repaso' ? (
                        <ReviewSection user={user} lessonKey={lessonKey} flashcards={lesson.flashcards} />
                    ) : activeTab === 'prueba' ? (
                        <div className="quiz-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            {quizMode === 'intro' && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '2rem', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    borderRadius: '24px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative Background Icon */}
                                    {subject?.icon && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            right: '-2rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%) rotate(-15deg)',
                                            opacity: 0.05,
                                            color: subject.color,
                                            pointerEvents: 'none'
                                        }}>
                                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 220 }) : null}
                                        </div>
                                    )}

                                    <h3 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
                                        Prueba: Lección {lessonId.replace('l', '')}
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.75rem', maxWidth: '550px', position: 'relative', zIndex: 1 }}>
                                        Demuestra lo que has aprendido en esta lección. Completa este reto para validar tus conocimientos y desbloquear el siguiente nivel.
                                    </p>
                                    <ul style={{ textAlign: 'left', color: '#cbd5e1', marginBottom: '2rem', display: 'inline-block', listStyle: 'none', padding: 0, position: 'relative', zIndex: 1 }}>
                                        <li style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                            10 preguntas de opción múltiple
                                        </li>
                                        <li style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color }}></div>
                                            30 segundos por pregunta
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                            Necesitas 100% de aciertos para avanzar
                                        </li>
                                    </ul>
                                    <button 
                                        onClick={startQuiz}
                                        className="nav-btn nav-btn-complete"
                                        style={{ background: subject.color, border: 'none', color: 'white', padding: '0.85rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: `0 8px 15px ${subject.color}30`, margin: '0', position: 'relative', zIndex: 1 }}
                                    >
                                        Iniciar Prueba
                                    </button>
                                </div>
                            )}

                            {quizMode === 'question' && (
                                <div style={{ 
                                    animation: 'fadeIn 0.5s ease-out',
                                    position: 'relative',
                                    padding: '1rem',
                                    borderRadius: '24px',
                                    overflow: 'hidden'
                                }}>
                                    {/* Time's Up Overlay */}
                                    {selectedAnswer === -1 && (
                                        <div className="animate-scale-in" style={{ 
                                            position: 'absolute', 
                                            inset: 0, 
                                            zIndex: 20, 
                                            background: 'rgba(15, 23, 42, 0.9)', 
                                            backdropFilter: 'blur(8px)', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                                <X size={80} color="#ef4444" strokeWidth={3} />
                                            </div>
                                            <span style={{ color: 'white', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                                ¡Tiempo Agotado!
                                            </span>
                                        </div>
                                    )}

                                    {/* Decorative Background Icon */}
                                    {subject?.icon && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            right: '-2rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%) rotate(-15deg)',
                                            opacity: 0.03,
                                            color: subject.color,
                                            pointerEvents: 'none'
                                        }}>
                                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 280 }) : null}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                                            Pregunta {currentQ + 1} de {quizQuestions.length}
                                        </span>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            color: timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444', 
                                            fontWeight: 700, 
                                            fontSize: '1.2rem',
                                            position: 'relative',
                                            zIndex: 2,
                                            transition: 'color 0.3s ease'
                                        }}>
                                            <Clock size={22} />
                                            {timeLeft}s
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '3px', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                                        {[...Array(30)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                style={{ 
                                                    flex: 1, 
                                                    height: '8px',
                                                    background: i < timeLeft 
                                                        ? (timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444') 
                                                        : 'rgba(255,255,255,0.1)',
                                                    borderRadius: '2px',
                                                    transition: 'all 0.3s ease'
                                                }} 
                                            />
                                        ))}
                                    </div>

                                    <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.5 }}>
                                        {quizQuestions[currentQ].q}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {quizQuestions[currentQ].options.map((option, optIdx) => {
                                            const isSelected = selectedAnswer === optIdx;
                                            const isCorrect = quizQuestions[currentQ].correct === optIdx;
                                            let bg = 'rgba(30, 41, 59, 0.4)';
                                            let border = '1px solid rgba(255,255,255,0.08)';
                                            
                                            if (selectedAnswer !== null && isSelected) {
                                                if (isCorrect) {
                                                    bg = 'rgba(16, 185, 129, 0.2)';
                                                    border = '2px solid #10b981';
                                                } else {
                                                    bg = 'rgba(239, 68, 68, 0.2)';
                                                    border = '2px solid #ef4444';
                                                }
                                            }

                                            return (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => handleQuizAnswer(optIdx)}
                                                    disabled={selectedAnswer !== null}
                                                    style={{
                                                        padding: '1.25rem 1.5rem',
                                                        background: bg,
                                                        border: border,
                                                        borderRadius: '16px',
                                                        textAlign: 'left',
                                                        cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        color: 'white',
                                                        fontSize: '1.05rem',
                                                        fontWeight: 500,
                                                        position: 'relative',
                                                        zIndex: 2
                                                    }}
                                                >
                                                    <span>{option}</span>
                                                    {selectedAnswer !== null && isSelected && isCorrect && <Check size={20} color="#10b981" />}
                                                    {selectedAnswer !== null && isSelected && !isCorrect && <X size={20} color="#ef4444" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {quizMode === 'result' && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '2rem', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    borderRadius: '24px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative Background Icon */}
                                    {subject?.icon && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            right: '-2rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%) rotate(-15deg)',
                                            opacity: 0.05,
                                            color: quizScore === quizQuestions.length ? '#10b981' : '#ef4444',
                                            pointerEvents: 'none'
                                        }}>
                                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 240 }) : null}
                                        </div>
                                    )}

                                    <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem' }}>
                                        {quizScore === quizQuestions.length ? <Trophy size={60} color="#10b981" /> : <AlertCircle size={60} color="#ef4444" />}
                                    </div>
                                    
                                    <h3 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                                        {quizScore === quizQuestions.length ? '¡Increíble! Dominio Total' : 'Sigue Practicando'}
                                    </h3>
                                    
                                    <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
                                        {quizScore === quizQuestions.length 
                                            ? 'Has superado el reto con éxito. Has demostrado un dominio absoluto de los temas de esta lección.' 
                                            : `Has acertado ${quizScore} de ${quizQuestions.length}. Para avanzar a la siguiente lección debes obtener el 100% de aciertos.`}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                                        <button 
                                            onClick={() => setQuizMode('intro')}
                                            className="nav-btn nav-btn-prev"
                                            style={{ margin: 0, padding: '0.75rem 1.5rem' }}
                                        >
                                            Repetir Prueba
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('contenido')}
                                            className="nav-btn nav-btn-complete"
                                            style={{ background: subject.color, border: 'none', color: 'white', margin: 0, padding: '0.75rem 1.5rem' }}
                                        >
                                            Volver al contenido
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'contenido' ? (
                        <div className="lesson-content-container">
                            <div dangerouslySetInnerHTML={{ __html: lesson.content?.replace(/font-size:\s*[^;]+;?/g, '') }} />
                            {lesson.hasSimulator && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h3 style={{ color: '#a855f7', margin: '2rem 0 1rem' }}>🔌 Simulacro</h3>
                                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Interactúa con el LED</p>
                                    <div style={{ maxWidth: '300px' }}>
                                        <LedSimulator />
                                    </div>
                                </div>
                            )}

                            {lesson.challenges && (
                                <div className="challenges-tabs-section" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: subject.color, padding: '8px', borderRadius: '10px' }}>
                                            <Code size={20} color="white" />
                                        </div>
                                        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Retos de Programación</h3>
                                    </div>
                                    
                                    <div className="challenges-nav" style={{ 
                                        display: 'flex', 
                                        gap: '4px', 
                                        alignItems: 'flex-end',
                                        marginBottom: '-1px',
                                        padding: '0 4px 0 24px', // 24px padding-left added
                                        position: 'relative',
                                        zIndex: 2
                                    }}>
                                        {lesson.challenges.map((c, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setActiveChallenge(idx)}
                                                style={{
                                                    padding: '12px 24px',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderBottom: activeChallenge === idx ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                    background: activeChallenge === idx ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.4)',
                                                    color: activeChallenge === idx ? 'white' : '#64748b',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '12px',
                                                    minWidth: '180px',
                                                    borderRadius: '12px 12px 0 0',
                                                    boxShadow: activeChallenge === idx ? '0 -10px 20px rgba(0,0,0,0.2)' : 'none',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    background: activeChallenge === idx ? subject.color : 'rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    color: activeChallenge === idx ? 'white' : '#94a3b8',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {idx + 1}
                                                </div>
                                                <span style={{ transition: 'all 0.3s ease' }}>{c.title}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div 
                                        className="challenge-display-area animate-fade-in" 
                                        key={activeChallenge}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.4)',
                                            borderRadius: '24px',
                                            padding: '2rem',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            minHeight: '200px',
                                            position: 'relative'
                                        }}
                                    >
                                        <button 
                                            onClick={() => setShowSimulator(true)}
                                            style={{
                                                position: 'absolute',
                                                top: '1.5rem',
                                                right: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: subject.color,
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 18px',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                boxShadow: `0 8px 20px ${subject.color}40`,
                                                transition: 'all 0.2s',
                                                zIndex: 10
                                            }}
                                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <PlayCircle size={18} /> Simular
                                        </button>

                                        <div dangerouslySetInnerHTML={{ __html: lesson.challenges[activeChallenge]?.content?.replace(/font-size:\s*[^;]+;?/g, '') || '' }} />
                                    </div>

                                    {showSimulator && (
                                        <MiniChallengeSimulator 
                                            challengeIdx={activeChallenge} 
                                            onClose={() => setShowSimulator(false)} 
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'simulador' ? (
                        <ChallengeRoadmap />
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{ __html: tabs.find(t => t.id === activeTab)?.content || '' }}
                        />
                    )}

                    {/* Final Navigation Buttons */}
                    <div className="lesson-nav-footer">
                        <button
                            className="nav-btn nav-btn-prev"
                            onClick={() => navigate(`/dashboard/my-courses/${courseId}`)}
                        >
                            <ArrowLeft size={20} />
                            <span>Módulos del curso</span>
                        </button>
                        <button
                            className="nav-btn nav-btn-complete"
                            style={{ background: subject.color, border: 'none' }}
                        >
                            <CheckCircle size={20} />
                            <span>Marcar como completada</span>
                        </button>
                    </div>
                </article>
            </main>
        </div>
    );
};

export default Lesson;
