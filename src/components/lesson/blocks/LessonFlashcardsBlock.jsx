import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Check,
    Code2,
    Cpu,
    Lightbulb,
    RefreshCw,
    X,
    RotateCcw,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    Square
} from 'lucide-react';
import {
    completeLearningSession,
    createLearningSession,
    saveFlashcardEvent
} from '../../../lib/learningAnalytics';
import { api } from '../../../lib/api';

const EMPTY_FLASHCARDS = [];

const getCategoryBadge = (type) => {
    switch (type) {
        case 'history': return { label: 'Historia & Origen', color: '#fbbf24', icon: '🏛️' };
        case 'atomic': return { label: 'Modelo Atómico', color: '#38bdf8', icon: '🔬' };
        case 'materials': return { label: 'Materiales & Dieléctricos', color: '#34d399', icon: '🛡️' };
        case 'theory': return { label: 'Teoría Fundamental', color: '#60a5fa', icon: '⚡' };
        case 'safety': return { label: 'Seguridad Eléctrica', color: '#f87171', icon: '⚠️' };
        case 'math': return { label: 'Leyes & Fórmulas', color: '#c084fc', icon: '📐' };
        case 'si': return { label: 'Prefijos del SI', color: '#a78bfa', icon: '📏' };
        case 'measurement': return { label: 'Medición & Tester', color: '#fb923c', icon: '🧰' };
        case 'hw': return { label: 'Hardware', color: '#38bdf8', icon: '🔌' };
        case 'sw': return { label: 'Software', color: '#34d399', icon: '💻' };
        default: return { label: 'Concepto Clave', color: '#a855f7', icon: '📚' };
    }
};

const LessonFlashcardsBlock = ({ block, user, lessonKey, subject }) => {
    const flashcards = Array.isArray(block.flashcards) ? block.flashcards : EMPTY_FLASHCARDS;
    const accentColor = subject?.color || '#a855f7';
    const lessonContent = block.lessonContent || '';

    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState('deck'); // 'deck' (1 enfocada) | 'grid' (mosaico compacto)
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
            const { data, error } = await api('/flashcards?lesson_id=' + encodeURIComponent(lessonKey));

            if (error) throw error;

            if (data && Array.isArray(data)) {
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

    const knownCount = flashcards.filter((card) => mastered[card.id] === 'known').length;
    const unknownCount = flashcards.filter((card) => mastered[card.id] === 'unknown').length;
    const totalAnswered = knownCount + unknownCount;
    const allAnswered = flashcards.length > 0 && totalAnswered === flashcards.length;
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
                await api('/flashcards', {
                    method: 'POST',
                    body: {
                        lesson_id: lessonKey,
                        card_id: card.id,
                        status,
                        mastery_level: status === 'known' ? 1 : 0
                    }
                });
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

        setTimeout(() => {
            setFlipped((prev) => ({ ...prev, [card.id]: false }));
            if (viewMode === 'deck' && currentIndex < flashcards.length - 1) {
                setCurrentIndex(prev => prev + 1);
            }
        }, 300);
    };

    // Render individual card helper
    const renderCard = (card, index, isSingleDeckView = false) => {
        const status = mastered[card.id];
        const category = getCategoryBadge(card.type);
        const statusColor = status === 'known' ? '#10b981' : status === 'unknown' ? '#ef4444' : category.color;
        const glow = `0 12px 30px ${statusColor}20`;

        return (
            <div
                key={card.id}
                className={`memory-card ${flipped[card.id] ? 'is-flipped' : ''}`}
                onClick={() => toggleFlip(card)}
                style={{
                    width: isSingleDeckView ? '100%' : '260px',
                    maxWidth: isSingleDeckView ? '440px' : '260px',
                    minHeight: '300px',
                    height: '300px',
                    perspective: '1000px',
                    cursor: 'pointer',
                    margin: isSingleDeckView ? '0 auto' : undefined
                }}
            >
                <div
                    className="card-inner"
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {/* ── FRENTE DE LA TARJETA (Pregunta) ── */}
                    <div
                        className="card-front"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            background: 'var(--bg-secondary)',
                            border: `2px solid ${status ? statusColor : 'var(--glass-border)'}`,
                            borderRadius: '22px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '1.2rem',
                            boxShadow: glow,
                            backdropFilter: 'blur(12px)',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Cabecera Superior */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: category.color,
                                background: `${category.color}18`,
                                border: `1px solid ${category.color}40`,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                {category.icon} {category.label}
                            </span>

                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                #{index + 1} / {flashcards.length}
                            </span>
                        </div>

                        {/* Centro: Pregunta */}
                        <div style={{ margin: 'auto 0', textAlign: 'center', padding: '0.5rem 0' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                                ¿PREGUNTA?
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: isSingleDeckView ? '1.15rem' : '1rem', lineHeight: 1.5 }}>
                                {card.q}
                            </div>
                        </div>

                        {/* Pie */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: '0.65rem' }}>
                            {status ? (
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    color: status === 'known' ? '#34d399' : '#f87171',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {status === 'known' ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                                    {status === 'known' ? 'Dominada' : 'Por Repasar'}
                                </span>
                            ) : (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Pendiente</span>
                            )}

                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <RotateCcw size={12} /> Toca para voltear
                            </span>
                        </div>
                    </div>

                    {/* ── REVERSO DE LA TARJETA (Respuesta + Botones) ── */}
                    <div
                        className="card-back"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            background: 'var(--bg-secondary)',
                            border: `2px solid ${status ? statusColor : category.color}`,
                            borderRadius: '22px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '1.2rem',
                            transform: 'rotateY(180deg)',
                            boxShadow: `0 15px 35px rgba(0,0,0,0.2), ${glow}`,
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Cabecera Superior */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: category.color,
                                background: `${category.color}18`,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                💡 RESPUESTA
                            </span>

                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
                                #{index + 1} / {flashcards.length}
                            </span>
                        </div>

                        {/* Centro: Respuesta y Subtítulo */}
                        <div style={{ margin: 'auto 0', textAlign: 'center', padding: '0.25rem 0', maxHeight: '165px', overflowY: 'auto' }}>
                            <div style={{
                                color: category.color,
                                fontWeight: 800,
                                fontSize: isSingleDeckView ? '1.2rem' : '1.05rem',
                                lineHeight: 1.4,
                                marginBottom: '0.45rem',
                                textShadow: `0 0 15px ${category.color}40`
                            }}>
                                {card.a}
                            </div>

                            {card.sub && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    padding: '0.45rem 0.65rem',
                                    fontSize: '0.76rem',
                                    color: '#cbd5e1',
                                    lineHeight: 1.45
                                }}>
                                    📖 {card.sub}
                                </div>
                            )}
                        </div>

                        {/* Pie: Botones de Acción */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem' }}>
                            <button
                                onClick={(event) => handleMark(event, card, 'unknown')}
                                style={{
                                    background: status === 'unknown' ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                                    color: status === 'unknown' ? '#ffffff' : '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    borderRadius: '10px',
                                    padding: '0.45rem 0.5rem',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <X size={15} strokeWidth={3} /> No lo sé
                            </button>

                            <button
                                onClick={(event) => handleMark(event, card, 'known')}
                                style={{
                                    background: status === 'known' ? '#10b981' : 'rgba(16, 185, 129, 0.15)',
                                    color: status === 'known' ? '#ffffff' : '#34d399',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '10px',
                                    padding: '0.45rem 0.5rem',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Check size={15} strokeWidth={3} /> ¡Lo sé!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: accentColor }}>
                <RefreshCw className="animate-spin" size={32} />
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="review-section-interactive" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Barra Superior de Control y Progreso */}
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: accentColor,
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Sparkles size={16} />
                        Progreso: {knownCount} / {flashcards.length} Dominadas
                    </div>
                    {unknownCount > 0 && (
                        <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
                            ({unknownCount} por reforzar)
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {/* Selector de Modo: Mazo Enfocado vs. Mosaico Compacto */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <button
                            onClick={() => setViewMode('deck')}
                            style={{
                                background: viewMode === 'deck' ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: viewMode === 'deck' ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            title="Modo Tarjeta Enfocada"
                        >
                            <Square size={13} /> Tarjeta
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                background: viewMode === 'grid' ? 'rgba(255,255,255,0.15)' : 'transparent',
                                color: viewMode === 'grid' ? '#ffffff' : '#94a3b8',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            title="Modo Mosaico Compacto"
                        >
                            <LayoutGrid size={13} /> Mosaico
                        </button>
                    </div>

                    <button
                        className={`summary-trigger summary-trigger-glow summary-trigger-${summaryStatus}`}
                        ref={summaryButtonRef}
                        onClick={() => openSummary(buildSummarySections())}
                        title="Ver resumen de repaso"
                    >
                        <Lightbulb size={16} />
                    </button>
                </div>
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
                                <div className="summary-empty">¡Excelente! Has dominado todas las tarjetas de la lección.</div>
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

            {/* ── MODO 1: MAZO ENFOCADO (1 Tarjeta con controles de navegación) ── */}
            {viewMode === 'deck' && currentCard && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', margin: '1rem 0 2rem' }}>
                    {renderCard(currentCard, currentIndex, true)}

                    {/* Controles de Navegación del Mazo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className="sim-btn sim-btn-secondary"
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            style={{ opacity: currentIndex === 0 ? 0.4 : 1, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', padding: '0.5rem 1rem' }}
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>

                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', minWidth: '80px', textAlign: 'center' }}>
                            {currentIndex + 1} de {flashcards.length}
                        </span>

                        <button
                            className="sim-btn sim-btn-secondary"
                            onClick={() => setCurrentIndex(prev => Math.min(flashcards.length - 1, prev + 1))}
                            disabled={currentIndex === flashcards.length - 1}
                            style={{ opacity: currentIndex === flashcards.length - 1 ? 0.4 : 1, cursor: currentIndex === flashcards.length - 1 ? 'not-allowed' : 'pointer', padding: '0.5rem 1rem' }}
                        >
                            Siguiente <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODO 2: MOSAICO COMPACTO (Cuadrícula de cartas de 260px) ── */}
            {viewMode === 'grid' && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1.25rem',
                    margin: '1rem 0 2rem'
                }}>
                    {flashcards.map((card, index) => renderCard(card, index, false))}
                </div>
            )}

            <div ref={contentRef} style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: lessonContent }} />
        </div>
    );
};

export default LessonFlashcardsBlock;
