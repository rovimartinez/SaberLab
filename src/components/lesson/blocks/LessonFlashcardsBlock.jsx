import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Code2, Cpu, Lightbulb, RefreshCw, X } from 'lucide-react';
import {
    completeLearningSession,
    createLearningSession,
    saveFlashcardEvent
} from '../../../lib/learningAnalytics';
import { supabase } from '../../../lib/supabase';

const EMPTY_FLASHCARDS = [];

const LessonFlashcardsBlock = ({ block, user, lessonKey, subject }) => {
    const flashcards = Array.isArray(block.flashcards) ? block.flashcards : EMPTY_FLASHCARDS;
    const accentColor = subject?.color || '#a855f7';
    const lessonContent = block.lessonContent || '';

    const [flipped, setFlipped] = useState({});
    const [mastered, setMastered] = useState({});
    const [loading, setLoading] = useState(false);
    const [reviewModal, setReviewModal] = useState({ open: false, title: '', html: '' });
    const [summaryModal, setSummaryModal] = useState({ open: false, sections: [] });
    const [analyzing, setAnalyzing] = useState(false);
    const [summaryShown, setSummaryShown] = useState(false);
    const [summaryClosing, setSummaryClosing] = useState(false);
    const [closeTransform, setCloseTransform] = useState('');
    const summaryButtonRef = useRef(null);
    const summaryModalRef = useRef(null);
    const contentRef = useRef(null);
    const sessionIdRef = useRef(null);
    const sessionStartedAtRef = useRef(null);
    const cardOpenedAtRef = useRef({});
    const summaryOpenedAtRef = useRef(null);
    const masteredRef = useRef({});

    const loadProgress = useCallback(async () => {
        if (!user?.id || !lessonKey) return;

        try {
            setLoading(true);
            const { data } = await supabase
                .from('student_flashcards')
                .select('card_id, status')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonKey);

            if (data) {
                const progress = {};
                data.forEach((item) => {
                    progress[item.card_id] = item.status;
                });
                setMastered(progress);
            }
        } catch (error) {
            console.error('Error loading flashcard progress:', error);
        } finally {
            setLoading(false);
        }
    }, [lessonKey, user?.id]);

    useEffect(() => {
        loadProgress();
    }, [loadProgress]);

    useEffect(() => {
        masteredRef.current = mastered;
    }, [mastered]);

    useEffect(() => {
        let isMounted = true;

        const startSession = async () => {
            if (!user?.id || !lessonKey || !flashcards.length) return;

            try {
                sessionStartedAtRef.current = Date.now();
                const session = await createLearningSession({
                    userId: user.id,
                    lessonId: lessonKey,
                    courseId: lessonKey.split('-')[0] ?? null,
                    source: 'web',
                    context: {
                        entry_point: 'flashcards',
                        flashcards_count: flashcards.length
                    }
                });

                if (isMounted) {
                    sessionIdRef.current = session?.id ?? null;
                }
            } catch (error) {
                console.error('Error creando sesion de flashcards:', error);
            }
        };

        startSession();

        return () => {
            isMounted = false;

            const finishSession = async () => {
                if (!sessionIdRef.current) return;

                try {
                    const masteredSnapshot = masteredRef.current;
                    const totalDurationMs = sessionStartedAtRef.current ? Date.now() - sessionStartedAtRef.current : null;
                    await completeLearningSession({
                        sessionId: sessionIdRef.current,
                        status: 'completed',
                        totalDurationMs,
                        activeDurationMs: totalDurationMs,
                        context: {
                            entry_point: 'flashcards',
                            answered_count: Object.keys(masteredSnapshot).length,
                            known_count: Object.values(masteredSnapshot).filter((value) => value === 'known').length,
                            unknown_count: Object.values(masteredSnapshot).filter((value) => value === 'unknown').length
                        }
                    });
                } catch (error) {
                    console.error('Error cerrando sesion de flashcards:', error);
                }
            };

            void finishSession();
        };
    }, [flashcards.length, lessonKey, user?.id]);

    const trackFlashcard = useCallback(async ({
        cardId,
        sectionId,
        eventType,
        responseTimeMs,
        payload = {}
    }) => {
        if (!user?.id || !lessonKey) return;

        try {
            await saveFlashcardEvent({
                sessionId: sessionIdRef.current,
                userId: user.id,
                lessonId: lessonKey,
                cardId,
                sectionId,
                eventType,
                responseTimeMs,
                payload
            });
        } catch (error) {
            console.error('Error guardando evento de flashcard:', error);
        }
    }, [lessonKey, user?.id]);

    const toggleFlip = (card) => {
        const nextFlipped = !flipped[card.id];
        const now = Date.now();

        if (nextFlipped) {
            cardOpenedAtRef.current[card.id] = now;
            void trackFlashcard({
                cardId: card.id,
                sectionId: card.sectionId,
                eventType: 'flip',
                payload: {
                    card_type: card.type,
                    prompt: card.q
                }
            });
        }

        setFlipped((prev) => ({ ...prev, [card.id]: nextFlipped }));
    };

    const getSectionTitle = (sectionId) => {
        if (!sectionId || !contentRef.current) return '';
        const heading = contentRef.current.querySelector(`#${sectionId}`);
        return heading ? heading.textContent : '';
    };

    const getTitleSortKey = (title) => {
        if (!title) return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        const match = title.match(/(\d+)\.(\d+)/);
        if (!match) return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        return [parseInt(match[1], 10), parseInt(match[2], 10)];
    };

    const buildSummarySections = useCallback(() => {
        const unknownCards = flashcards.filter((card) => mastered[card.id] === 'unknown');
        const sectionMap = new Map();

        unknownCards.forEach((card) => {
            const title = getSectionTitle(card.sectionId) || 'Contenido';
            if (!sectionMap.has(title)) {
                sectionMap.set(title, []);
            }
            sectionMap.get(title).push(card.q);
        });

        return Array.from(sectionMap.entries())
            .map(([title, questions]) => ({ title, questions }))
            .sort((a, b) => {
                const [a1, a2] = getTitleSortKey(a.title);
                const [b1, b2] = getTitleSortKey(b.title);
                if (a1 !== b1) return a1 - b1;
                return a2 - b2;
            });
    }, [flashcards, mastered]);

    const allAnswered = flashcards.length > 0 && flashcards.every((card) => mastered[card.id]);
    const unknownCount = flashcards.filter((card) => mastered[card.id] === 'unknown').length;
    const summaryStatus = !allAnswered ? 'neutral' : unknownCount === 0 ? 'ok' : unknownCount <= 2 ? 'warn' : 'danger';

    const openSummary = useCallback((sections) => {
        summaryOpenedAtRef.current = Date.now();
        setSummaryModal({ open: true, sections });
        void trackFlashcard({
            cardId: '__summary__',
            eventType: 'summary_open',
            payload: {
                sections_count: sections.length
            }
        });
    }, [trackFlashcard]);

    useEffect(() => {
        if (!flashcards.length || summaryShown) return;
        const allDone = flashcards.every((card) => mastered[card.id]);
        if (!allDone) return;

        const mainTimeout = setTimeout(() => {
            const unknownCards = flashcards.filter((card) => mastered[card.id] === 'unknown');
            if (unknownCards.length === 0) {
                setSummaryShown(true);
                openSummary([]);
                return;
            }

            const sections = buildSummarySections();
            setAnalyzing(true);

            const analysisTimeout = setTimeout(() => {
                setAnalyzing(false);
                openSummary(sections);
                setSummaryShown(true);
            }, 2000);

            return () => clearTimeout(analysisTimeout);
        }, 2000);

        return () => clearTimeout(mainTimeout);
    }, [buildSummarySections, flashcards, mastered, openSummary, summaryShown]);

    const closeSummary = () => {
        const responseTimeMs = summaryOpenedAtRef.current ? Date.now() - summaryOpenedAtRef.current : null;

        if (summaryModal.open) {
            void trackFlashcard({
                cardId: '__summary__',
                eventType: 'summary_close',
                responseTimeMs,
                payload: {
                    sections_count: summaryModal.sections.length
                }
            });
        }

        if (summaryButtonRef.current && summaryModalRef.current) {
            const btn = summaryButtonRef.current.getBoundingClientRect();
            const modal = summaryModalRef.current.getBoundingClientRect();
            const targetX = btn.left + btn.width / 2;
            const targetY = btn.top + btn.height / 2;
            const dx = targetX - modal.left;
            const dy = targetY - modal.top;
            setCloseTransform(`translate(${dx}px, ${dy}px) scale(0.35)`);
        } else {
            setCloseTransform('translate(200px, -140px) scale(0.35)');
        }

        setSummaryClosing(true);
        setTimeout(() => {
            setSummaryModal({ open: false, sections: [] });
            setSummaryClosing(false);
            setCloseTransform('');
            summaryOpenedAtRef.current = null;
        }, 500);
    };

    const handleMark = async (event, card, status) => {
        event.stopPropagation();
        setMastered((prev) => ({ ...prev, [card.id]: status }));

        const responseTimeMs = cardOpenedAtRef.current[card.id]
            ? Date.now() - cardOpenedAtRef.current[card.id]
            : null;

        if (user?.id && lessonKey) {
            try {
                await supabase.from('student_flashcards').upsert({
                    user_id: user.id,
                    lesson_id: lessonKey,
                    card_id: card.id,
                    status,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, lesson_id, card_id' });
            } catch (error) {
                console.error('Error saving flashcard progress:', error);
            }
        }

        void trackFlashcard({
            cardId: card.id,
            sectionId: card.sectionId,
            eventType: status === 'known' ? 'mark_known' : 'mark_unknown',
            responseTimeMs,
            payload: {
                card_type: card.type,
                prompt: card.q
            }
        });

        delete cardOpenedAtRef.current[card.id];

        setTimeout(() => setFlipped((prev) => ({ ...prev, [card.id]: false })), 200);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: accentColor }}>
                <RefreshCw className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="review-section-interactive" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="review-hint" style={{ padding: '0 1rem 0.25rem 1rem' }}>
                <span>Haz clic en una tarjeta para ver la respuesta</span>
                <button
                    className={`summary-trigger summary-trigger-glow summary-trigger-${summaryStatus}`}
                    ref={summaryButtonRef}
                    onClick={() => openSummary(buildSummarySections())}
                    title="Ver resumen de repaso"
                >
                    <Lightbulb size={16} />
                </button>
            </div>

            {reviewModal.open && (
                <div className="review-modal-backdrop" onClick={() => setReviewModal({ open: false, title: '', html: '' })}>
                    <div className="review-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="review-modal-header">
                            <h4>{reviewModal.title}</h4>
                            <button onClick={() => setReviewModal({ open: false, title: '', html: '' })}>Cerrar</button>
                        </div>
                        <div className="review-modal-content" dangerouslySetInnerHTML={{ __html: reviewModal.html }} />
                    </div>
                </div>
            )}

            {analyzing && (
                <div className="summary-modal-backdrop">
                        <div className="summary-modal">
                            <div className="summary-title">Analizando...</div>
                        <div className="summary-sub">Revisando tus tarjetas pendientes</div>
                        <div className="summary-dots" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </div>
            )}

            {summaryModal.open && (
                <div className="summary-modal-backdrop" onClick={closeSummary}>
                    <div
                        ref={summaryModalRef}
                        className={`summary-modal${summaryClosing ? ' summary-modal-closing' : ''}`}
                        onClick={(event) => event.stopPropagation()}
                        style={summaryClosing && closeTransform ? { transform: closeTransform } : undefined}
                    >
                        <div className="summary-modal-header">
                            <div className="summary-modal-title">Resumen de tu repaso</div>
                            <button className="summary-close" onClick={closeSummary}>×</button>
                        </div>
                        <div className="summary-sub">Estas secciones corresponden a las tarjetas marcadas como "No lo sé".</div>
                        <div className="summary-list">
                            {summaryModal.sections.length === 0 ? (
                                <div className="summary-empty">No tienes pendientes por repasar.</div>
                            ) : (
                                summaryModal.sections.map((section, index) => (
                                    <div key={`${section.title}-${index}`} className="summary-section">
                                        <div className="summary-section-title">{section.title}</div>
                                        <ul className="summary-questions">
                                            {section.questions.map((question, questionIndex) => (
                                                <li key={`${section.title}-${questionIndex}`}>{question}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="review-grid">
                {flashcards.map((card) => {
                    const status = mastered[card.id];
                    const cardBg = 'rgba(15, 23, 42, 0.98)';
                    const statusColor = status === 'known' ? '#10b981' : status === 'unknown' ? '#ef4444' : accentColor;
                    const glow = `0 0 20px ${statusColor}20`;

                    return (
                        <div
                            key={card.id}
                            className={`memory-card ${flipped[card.id] ? 'is-flipped' : ''}`}
                            onClick={() => toggleFlip(card)}
                            style={{ height: '210px', perspective: '1000px', cursor: 'pointer' }}
                        >
                            <div
                                className="card-inner"
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                <div
                                    className="card-front"
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        background: cardBg,
                                        border: `3px solid ${statusColor}`,
                                        borderRadius: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        boxShadow: glow,
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.4s ease'
                                    }}
                                >
                                    {status && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '12px',
                                                padding: '6px 10px',
                                                borderRadius: '999px',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                color: status === 'known' ? '#10b981' : '#ef4444',
                                                background: status === 'known' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                border: `1px solid ${status === 'known' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
                                            }}
                                        >
                                            {status === 'known' ? 'Lo sé' : 'No lo sé'}
                                        </div>
                                    )}
                                    <div className="card-icon-bg" style={{ color: `${accentColor}40` }}>
                                        {card.type === 'hw' ? <Cpu size={96} /> : <Code2 size={96} />}
                                    </div>
                                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.4 }}>{card.q}</span>
                                </div>
                                <div
                                    className="card-back"
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        background: 'rgba(15, 23, 42, 0.98)',
                                        border: `3px solid ${statusColor}`,
                                        borderRadius: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        transform: 'rotateY(180deg)',
                                        boxShadow: `0 20px 40px rgba(0,0,0,0.5), ${glow}`,
                                        transition: 'all 0.4s ease'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: statusColor,
                                            fontWeight: 900,
                                            fontSize: '1.5rem',
                                            marginBottom: '14px',
                                            textShadow: `0 0 20px ${statusColor}60`,
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        {card.a}
                                    </span>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.6, fontWeight: 500 }}>
                                        {card.sub}
                                    </p>
                                    <div style={{ display: 'flex', gap: '14px' }}>
                                        <button
                                            onClick={(event) => handleMark(event, card, 'known')}
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                border: 'none',
                                                background: '#10b981',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)'
                                            }}
                                            onMouseOver={(event) => {
                                                event.currentTarget.style.transform = 'scale(1.1)';
                                                event.currentTarget.style.filter = 'brightness(1.1)';
                                            }}
                                            onMouseOut={(event) => {
                                                event.currentTarget.style.transform = 'scale(1)';
                                                event.currentTarget.style.filter = 'brightness(1)';
                                            }}
                                        >
                                            <Check size={22} strokeWidth={4} />
                                        </button>
                                        <button
                                            onClick={(event) => handleMark(event, card, 'unknown')}
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                border: 'none',
                                                background: '#ef4444',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)'
                                            }}
                                            onMouseOver={(event) => {
                                                event.currentTarget.style.transform = 'scale(1.1)';
                                                event.currentTarget.style.filter = 'brightness(1.1)';
                                            }}
                                            onMouseOut={(event) => {
                                                event.currentTarget.style.transform = 'scale(1)';
                                                event.currentTarget.style.filter = 'brightness(1)';
                                            }}
                                        >
                                            <X size={22} strokeWidth={4} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div ref={contentRef} style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: lessonContent }} />
        </div>
    );
};

export default LessonFlashcardsBlock;
