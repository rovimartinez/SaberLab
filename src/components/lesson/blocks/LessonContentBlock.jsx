import React, { useEffect, useRef, useState } from 'react';
import { Code, PlayCircle, X } from 'lucide-react';
import {
    completeLearningSession,
    createLearningSession,
    saveContentEvent
} from '../../../lib/learningAnalytics';

const MiniChallengeLedBulb = ({ color, isOn, glowColor }) => (
    <div
        style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isOn ? color : '#1e293b',
            boxShadow: isOn ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40` : 'inset 0 4px 10px rgba(0,0,0,0.4)',
            border: `3px solid ${isOn ? glowColor : '#334155'}`,
            transition: 'all 0.3s ease'
        }}
    />
);

const MiniChallengeSimulator = ({ challengeIdx, onClose }) => {
    const [leds, setLeds] = useState({
        r: false,
        y: false,
        g: false,
        blue: false,
        s1: false,
        s2: false,
        s3: false,
        s4: false,
        s5: false
    });

    useEffect(() => {
        let isActive = true;
        let currentTimeout;

        const wait = (ms) => new Promise((resolve) => {
            currentTimeout = setTimeout(resolve, ms);
        });

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
                    const punto = 200;
                    const raya = 600;
                    for (let i = 0; i < 3; i += 1) {
                        setLeds({ ...deat, r: true });
                        await wait(punto);
                        if (!isActive) break;
                        setLeds(deat);
                        await wait(punto);
                        if (!isActive) break;
                    }
                    if (!isActive) break;
                    await wait(600);
                    for (let i = 0; i < 3; i += 1) {
                        setLeds({ ...deat, r: true });
                        await wait(raya);
                        if (!isActive) break;
                        setLeds(deat);
                        await wait(punto);
                        if (!isActive) break;
                    }
                    if (!isActive) break;
                    await wait(600);
                    for (let i = 0; i < 3; i += 1) {
                        setLeds({ ...deat, r: true });
                        await wait(punto);
                        if (!isActive) break;
                        setLeds(deat);
                        await wait(punto);
                        if (!isActive) break;
                    }
                    if (!isActive) break;
                    await wait(2000);
                } else if (challengeIdx === 2) {
                    setLeds({ r: true, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(300);
                    if (!isActive) break;
                    setLeds({ r: false, y: false, g: false, blue: true, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(300);
                } else if (challengeIdx === 3) {
                    const pins = ['s1', 's2', 's3', 's4', 's5'];
                    for (const pin of pins) {
                        const state = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                        state[pin] = true;
                        setLeds(state);
                        await wait(200);
                        if (!isActive) break;
                    }
                    for (let i = 3; i >= 1; i -= 1) {
                        const state = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                        state[`s${i + 1}`] = true;
                        setLeds(state);
                        await wait(200);
                        if (!isActive) break;
                    }
                } else if (challengeIdx === 4) {
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

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1100,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
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
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '1.2rem',
                        top: '1.2rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={18} />
                </button>

                <h4 style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    Simulador del Reto
                </h4>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        minHeight: challengeIdx === 4 ? '220px' : '150px'
                    }}
                >
                    {challengeIdx === 2 ? (
                        <div
                            style={{
                                background: 'linear-gradient(90deg, #111, #222)',
                                padding: '24px 32px',
                                borderRadius: '16px',
                                border: '3px solid #333',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.9)',
                                display: 'flex',
                                gap: '24px'
                            }}
                        >
                            <MiniChallengeLedBulb color="#3b82f6" glowColor="#3b82f6" isOn={leds.blue} />
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                        </div>
                    ) : challengeIdx === 3 ? (
                        <div
                            style={{
                                background: '#111',
                                padding: '16px 24px',
                                borderRadius: '16px',
                                border: '3px solid #333',
                                display: 'flex',
                                gap: '12px'
                            }}
                        >
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s1} />
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s2} />
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s3} />
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s4} />
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s5} />
                        </div>
                    ) : challengeIdx === 4 ? (
                        <div
                            style={{
                                background: 'linear-gradient(180deg, #111, #222)',
                                padding: '24px',
                                borderRadius: '24px',
                                border: '3px solid #333',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.9)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}
                        >
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                            <MiniChallengeLedBulb color="#facc15" glowColor="#facc15" isOn={leds.y} />
                            <MiniChallengeLedBulb color="#10b981" glowColor="#10b981" isOn={leds.g} />
                        </div>
                    ) : (
                        <div
                            style={{
                                background: '#0f172a',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)'
                            }}
                        >
                            <MiniChallengeLedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                        </div>
                    )}
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
                    {challengeIdx === 0 && 'Parpadeo constante configurado a 200ms'}
                    {challengeIdx === 1 && 'Ciclo S.O.S reproduciendo (... --- ...)'}
                    {challengeIdx === 2 && 'Modo persecución: alternando azul y rojo'}
                    {challengeIdx === 3 && 'Modo secuenciador: barrido de 5 luces'}
                    {challengeIdx === 4 && 'Reto maestro: programación de tráfico'}
                </p>
            </div>
        </div>
    );
};

const LessonContentBlock = ({
    block,
    lesson,
    lessonKey,
    moduleId,
    subject,
    user,
    activeChallenge,
    setActiveChallenge,
    showSimulator,
    setShowSimulator
}) => {
    const challenges = block?.challenges || [];
    const sessionIdRef = useRef(null);
    const sessionStartedAtRef = useRef(null);
    const activeChallengeRef = useRef(activeChallenge);
    const showSimulatorRef = useRef(showSimulator);
    const hasTrackedInitialChallengeRef = useRef(false);

    useEffect(() => {
        activeChallengeRef.current = activeChallenge;
    }, [activeChallenge]);

    useEffect(() => {
        showSimulatorRef.current = showSimulator;
    }, [showSimulator]);

    useEffect(() => {
        let isMounted = true;

        const startSession = async () => {
            if (!user?.id || !lessonKey) return;

            try {
                sessionStartedAtRef.current = Date.now();
                const session = await createLearningSession({
                    userId: user.id,
                    lessonId: lessonKey,
                    courseId: lessonKey.split('-')[0] ?? null,
                    moduleId,
                    source: 'web',
                    context: {
                        entry_point: 'content',
                        block_id: block?.id ?? null,
                        challenges_count: challenges.length
                    }
                });

                if (!isMounted) return;

                sessionIdRef.current = session?.id ?? null;

                await saveContentEvent({
                    sessionId: session?.id ?? null,
                    userId: user.id,
                    lessonId: lessonKey,
                    blockId: block?.id ?? null,
                    eventType: 'content_view',
                    payload: {
                        challenges_count: challenges.length
                    }
                });
            } catch (error) {
                console.error('Error iniciando analitica de contenido:', error);
            }
        };

        void startSession();

        const handleFocus = () => {
            void saveContentEvent({
                sessionId: sessionIdRef.current,
                userId: user?.id,
                lessonId: lessonKey,
                blockId: block?.id ?? null,
                eventType: 'focus'
            });
        };

        const handleBlur = () => {
            void saveContentEvent({
                sessionId: sessionIdRef.current,
                userId: user?.id,
                lessonId: lessonKey,
                blockId: block?.id ?? null,
                eventType: 'blur'
            });
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);

            const finishSession = async () => {
                if (!sessionIdRef.current) return;

                try {
                    const totalDurationMs = sessionStartedAtRef.current ? Date.now() - sessionStartedAtRef.current : null;
                    await completeLearningSession({
                        sessionId: sessionIdRef.current,
                        status: 'completed',
                        totalDurationMs,
                        activeDurationMs: totalDurationMs,
                        maxScrollDepth: typeof window !== 'undefined' ? Math.max(0, Math.min(100, ((window.scrollY + window.innerHeight) / Math.max(document.documentElement.scrollHeight, 1)) * 100)) : null,
                        context: {
                            entry_point: 'content',
                            block_id: block?.id ?? null,
                            last_active_challenge: activeChallengeRef.current,
                            simulator_opened: showSimulatorRef.current
                        }
                    });
                } catch (error) {
                    console.error('Error cerrando analitica de contenido:', error);
                }
            };

            void finishSession();
        };
    }, [block?.id, challenges.length, lessonKey, moduleId, user?.id]);

    useEffect(() => {
        if (!user?.id || !lessonKey || !challenges.length) return;
        if (!challenges[activeChallenge]) return;

        if (!hasTrackedInitialChallengeRef.current) {
            hasTrackedInitialChallengeRef.current = true;
        }

        void saveContentEvent({
            sessionId: sessionIdRef.current,
            userId: user.id,
            lessonId: lessonKey,
            blockId: block?.id ?? null,
            sectionId: `challenge-${activeChallenge + 1}`,
            eventType: 'challenge_view',
            eventValue: activeChallenge + 1,
            payload: {
                challenge_index: activeChallenge,
                challenge_title: challenges[activeChallenge].title ?? null
            }
        });
    }, [activeChallenge, block?.id, challenges, lessonKey, user?.id]);

    useEffect(() => {
        if (!showSimulator || !user?.id || !lessonKey || !challenges[activeChallenge]) return;

        void saveContentEvent({
            sessionId: sessionIdRef.current,
            userId: user.id,
            lessonId: lessonKey,
            blockId: block?.id ?? null,
            sectionId: `challenge-${activeChallenge + 1}`,
            eventType: 'challenge_simulate',
            eventValue: activeChallenge + 1,
            payload: {
                challenge_index: activeChallenge,
                challenge_title: challenges[activeChallenge].title ?? null
            }
        });
    }, [activeChallenge, block?.id, challenges, lessonKey, showSimulator, user?.id]);

    const htmlToRender = block?.content !== undefined ? block.content : (lesson?.content || '');

    return (
        <div className="lesson-content-container">
            <div key={block?.id || 'content-block'} dangerouslySetInnerHTML={{ __html: htmlToRender }} />

            {challenges.length > 0 && (
                <div className="challenges-tabs-section" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: subject.color, padding: '8px', borderRadius: '10px' }}>
                            <Code size={20} color="white" />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Retos de Programación</h3>
                    </div>

                    <div
                        className="challenges-nav"
                        style={{
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'flex-end',
                            marginBottom: '-1px',
                            padding: '0 4px 0 24px',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        {challenges.map((challenge, index) => (
                            <button
                                key={challenge.title || index}
                                onClick={() => setActiveChallenge(index)}
                                style={{
                                    padding: '12px 24px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderBottom: activeChallenge === index ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                    background: activeChallenge === index ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.4)',
                                    color: activeChallenge === index ? 'white' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    borderRadius: '12px 12px 0 0',
                                    boxShadow: activeChallenge === index ? '0 -10px 20px rgba(0,0,0,0.2)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                <div
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        background: activeChallenge === index ? subject.color : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        color: activeChallenge === index ? 'white' : '#94a3b8',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <span className="challenge-title-text" style={{ transition: 'all 0.3s ease' }}>{challenge.title}</span>
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
                        <div
                            dangerouslySetInnerHTML={{
                                __html: challenges[activeChallenge]?.content?.replace(/font-size:\s*[^;]+;?/g, '') || ''
                            }}
                        />

                        <button
                            className="btn-simular-reto"
                            onClick={() => setShowSimulator(true)}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
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
                            onMouseOver={(event) => {
                                event.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(event) => {
                                event.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <PlayCircle size={18} /> Simular
                        </button>
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
    );
};

export default LessonContentBlock;
