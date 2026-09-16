import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Clock, AlertTriangle, ShieldCheck, Activity, Layers, CheckCircle2, Award, ShieldAlert, Eye, EyeOff, Maximize, Lock, AlertOctagon, Sparkles, Flag, Wifi, WifiOff } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { getLessonInfo, LESSONS_REGISTRY } from '../data/coursesData.jsx';
import PracticalLabL6, { calculatePracticalScore } from '../components/simulators/electricity/PracticalLabL6';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionPanel from '../components/QuestionPanel';
import '../styles/EvaluationInstruction.css';
import '../styles/AntiCheatOverlay.css';

// Generador de audio de advertencia sintético (Web Audio API)
const playWarningBeep = (isFatal = false) => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = isFatal ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(isFatal ? 300 : 580, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (isFatal ? 0.7 : 0.35));
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + (isFatal ? 0.7 : 0.35));
    } catch {
        // Bloqueo de audio previo a interacción
    }
};

const getQuestionText = (question) => question?.question || question?.question_text || question?.q || question?.text || '';

const getOptionValue = (option) => {
    if (option && typeof option === 'object') {
        return option.value ?? option.text ?? option.label ?? '';
    }
    return option;
};

const normalizeCorrectAnswer = (question, options) => {
    const rawCorrect = question?.correct_answer !== undefined ? question.correct_answer : question?.correct;
    if (typeof rawCorrect === 'number' && options[rawCorrect] !== undefined) {
        return getOptionValue(options[rawCorrect]);
    }
    const correctText = String(rawCorrect ?? '').trim();
    if (/^[A-F]$/i.test(correctText)) {
        const index = correctText.toUpperCase().charCodeAt(0) - 65;
        if (options[index] !== undefined) {
            return getOptionValue(options[index]);
        }
    }
    return rawCorrect;
};

const normalizeSavedAnswers = (savedAnswers, normalizedQuestions) => {
    const nextAnswers = {};
    Object.entries(savedAnswers || {}).forEach(([questionIndex, answer]) => {
        const options = normalizedQuestions[Number(questionIndex)]?.options || [];
        if (typeof answer === 'number') {
            nextAnswers[questionIndex] = getOptionValue(options[answer]);
            return;
        }
        if (/^\d+$/.test(String(answer)) && options[Number(answer)] !== undefined) {
            nextAnswers[questionIndex] = getOptionValue(options[Number(answer)]);
            return;
        }
        nextAnswers[questionIndex] = answer;
    });
    return nextAnswers;
};

const EvaluationPlayer = () => {
    const { evaluationKey } = useParams();
    const navigate = useNavigate();
    const { user, isStaff } = useAuth();
    const normKey = (evaluationKey || '').toLowerCase();
    const isExamenL6 = normKey === 'ee-m1-l6';
    
    const [currentQuestion, setCurrentQuestion] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_current_q_${evaluationKey}`);
            return saved !== null ? parseInt(saved, 10) : 0;
        } catch { return 0; }
    });
    const [activePhase, setActivePhase] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_active_phase_${evaluationKey}`);
            return saved || 'teoria';
        } catch { return 'teoria'; }
    });
    const [practicalScore, setPracticalScore] = useState(0);
    const [showTheorySummary, setShowTheorySummary] = useState(false);
    const [reviewMode, setReviewMode] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('review') === 'true';
    });
    const [showTimeWarningModal, setShowTimeWarningModal] = useState(false);
    const [hasShown3MinWarning, setHasShown3MinWarning] = useState(false);

    // ── ESTADOS DEL SISTEMA ANTITRAMPA SENTINEL ──
    const [strikes, setStrikes] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_strikes_${evaluationKey}`);
            return saved ? parseInt(saved, 10) : 0;
        } catch { return 0; }
    });
    const [tabSwitches, setTabSwitches] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_tab_switches_${evaluationKey}`);
            return saved ? parseInt(saved, 10) : 0;
        } catch { return 0; }
    });
    const [fullscreenExits, setFullscreenExits] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_fs_exits_${evaluationKey}`);
            return saved ? parseInt(saved, 10) : 0;
        } catch { return 0; }
    });
    const [showStrikeModal, setShowStrikeModal] = useState(false);
    const [strikeModalData, setStrikeModalData] = useState({ number: 1, reason: '' });
    const lastInfractionTimeRef = useRef(0);

    // Guardar posición de navegación en tiempo real
    useEffect(() => {
        if (evaluationKey) {
            localStorage.setItem(`exam_current_q_${evaluationKey}`, currentQuestion.toString());
        }
    }, [currentQuestion, evaluationKey]);

    useEffect(() => {
        if (evaluationKey) {
            localStorage.setItem(`exam_active_phase_${evaluationKey}`, activePhase);
        }
    }, [activePhase, evaluationKey]);
    const [answers, setAnswers] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_answers_${evaluationKey}`);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    
    const [timeLeft, setTimeLeft] = useState(0);
    const [evaluation, setEvaluation] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [examStarted, setExamStarted] = useState(() => {
        return localStorage.getItem(`exam_started_${evaluationKey}`) === 'true';
    });
    const [finalizing, setFinalizing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('saved');
    const [showResults, setShowResults] = useState(false);
    const [result, setResult] = useState(null);

    // ── ESTADOS DE MARCAR PREGUNTAS Y CONEXIÓN ──
    const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_flagged_${evaluationKey}`);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
    const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true));

    const handleToggleFlag = (index) => {
        setFlaggedQuestions(prev => {
            const next = { ...prev, [index]: !prev[index] };
            if (!next[index]) delete next[index];
            localStorage.setItem(`exam_flagged_${evaluationKey}`, JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setSyncStatus('saved');
        };
        const handleOffline = () => {
            setIsOnline(false);
            setSyncStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Cargar puntaje de práctica en tiempo real
    useEffect(() => {
        const updatePracticalScore = () => {
            if (evaluationKey === 'ee-m1-l6' || evaluationKey === 'EE-M1-L6') {
                try {
                    const normKey = (evaluationKey || '').toLowerCase();
                    const saved = localStorage.getItem(`practical_answers_${normKey}`) || 
                                  localStorage.getItem(`practical_answers_${evaluationKey}`) ||
                                  localStorage.getItem('practical_answers_ee-m1-l6');
                    let practicalData = {};
                    if (saved) practicalData = JSON.parse(saved);
                    const { score } = calculatePracticalScore(practicalData);
                    setPracticalScore(score);
                } catch {
                    // ignore
                }
            }
        };
        updatePracticalScore();
    }, [evaluationKey, activePhase, reviewMode, showResults]);

    useEffect(() => {
        const fetchEvaluation = async () => {
            if (!evaluationKey) return;
            
            try {
                const { data, error } = await api(`/evaluations?key=${encodeURIComponent(evaluationKey)}`);

                let evalObj = data;
                if (!evalObj && LESSONS_REGISTRY[evaluationKey]) {
                    const lesson = await LESSONS_REGISTRY[evaluationKey].load?.();
                    if (lesson) {
                        evalObj = {
                            id: evaluationKey,
                            evaluation_key: evaluationKey,
                            title: lesson.title || 'Evaluación de Módulo',
                            description: lesson.description || (evaluationKey.startsWith('ee-') ? 'Evaluación Integral del Módulo 1 (Teoría: 60 pts + Práctica: 90 pts = 150 pts)' : 'Evaluación del Módulo'),
                            questions: lesson.questions || [],
                            points: lesson.points || 150,
                            time_limit: lesson.time_limit || 60,
                            passing_score: lesson.passing_score || 70
                        };
                    }
                }

                if (evalObj) {
                    setEvaluation(evalObj);
                    
                    // Normalizar preguntas (manejar JSON guardado en D1)
                    let rawQuestions = [];
                    if (Array.isArray(evalObj.questions)) {
                        rawQuestions = evalObj.questions;
                    } else if (typeof evalObj.questions === 'string') {
                        try {
                            let p = JSON.parse(evalObj.questions);
                            if (typeof p === 'string') p = JSON.parse(p);
                            rawQuestions = Array.isArray(p) ? p : [];
                        } catch {
                            rawQuestions = [];
                        }
                    }

                    const shuffleArray = (arr) => {
                        const copy = [...arr];
                        for (let i = copy.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [copy[i], copy[j]] = [copy[j], copy[i]];
                        }
                        return copy;
                    };

                    let finalQuestions = [];
                    const savedQuestionsKey = `exam_shuffled_questions_${evaluationKey}`;
                    const savedQuestionsJson = localStorage.getItem(savedQuestionsKey);

                    if (savedQuestionsJson) {
                        try {
                            finalQuestions = JSON.parse(savedQuestionsJson);
                        } catch {
                            finalQuestions = [];
                        }
                    }

                    if (!finalQuestions || finalQuestions.length === 0) {
                        const shuffledRawQuestions = shuffleArray(rawQuestions);
                        finalQuestions = shuffledRawQuestions.map(q => {
                            let opts = [];
                            if (Array.isArray(q.options)) {
                                opts = q.options.map(getOptionValue);
                            } else if (typeof q.options === 'string') {
                                try {
                                    const parsedOpts = JSON.parse(q.options);
                                    opts = Array.isArray(parsedOpts) ? parsedOpts.map(getOptionValue) : [];
                                } catch {
                                    opts = [];
                                }
                            }
                            const correctVal = normalizeCorrectAnswer(q, opts);
                            const shuffledOpts = shuffleArray(opts);

                            return {
                                ...q,
                                q: getQuestionText(q),
                                options: shuffledOpts,
                                correct: correctVal
                            };
                        });
                        localStorage.setItem(savedQuestionsKey, JSON.stringify(finalQuestions));
                    }

                    setQuestions(finalQuestions);
                    setAnswers(prevAnswers => {
                        const normalizedAnswers = normalizeSavedAnswers(prevAnswers, finalQuestions);
                        localStorage.setItem(`exam_answers_${evaluationKey}`, JSON.stringify(normalizedAnswers));
                        return normalizedAnswers;
                    });

                    // --- TIEMPO REAL PERSISTENTE ---
                    const savedEndTime = localStorage.getItem(`exam_end_time_${evaluationKey}`);
                    const now = Math.floor(Date.now() / 1000);
                    
                    if (savedEndTime && parseInt(savedEndTime, 10) > now) {
                        const remaining = parseInt(savedEndTime, 10) - now;
                        setTimeLeft(remaining);
                        setExamStarted(true);
                    } else {
                        const limitSeconds = (evalObj.time_limit || 60) * 60;
                        setTimeLeft(limitSeconds);
                        setExamStarted(false);
                    }

                    // --- RECUPERAR INTENTO DESDE D1 O LOCALSTORAGE ---
                    const normKey = (evaluationKey || '').toLowerCase();
                    let localCompleted = null;
                    try {
                        const saved = localStorage.getItem(`exam_completed_${normKey}`) || 
                                      localStorage.getItem(`exam_completed_${evaluationKey}`);
                        if (saved) localCompleted = JSON.parse(saved);
                    } catch {}

                    try {
                        const { data: attemptsData } = await api(`/attempts?evaluation_key=${encodeURIComponent(evaluationKey)}`);
                        const lastAttempt = (Array.isArray(attemptsData) && attemptsData.length > 0) ? attemptsData[0] : null;
                        const isReviewRequested = new URLSearchParams(window.location.search).get('review') === 'true';
                        const areResultsReleased = isStaff || (evalObj.results_released !== 0 && evalObj.results_released !== false && lastAttempt?.results_released !== false);

                        if (lastAttempt && lastAttempt.completed_at) {
                            setFinalizing(false);
                            setExamStarted(false);
                            if (!isReviewRequested || !areResultsReleased) {
                                setShowResults(true);
                                setReviewMode(false);
                            } else {
                                setReviewMode(true);
                                setShowResults(false);
                            }
                            setResult({
                                score: areResultsReleased ? lastAttempt.score : null,
                                totalPts: areResultsReleased ? (lastAttempt.points_obtained ?? lastAttempt.score) : null,
                                maxExamPts: lastAttempt.max_points || 150,
                                passed: areResultsReleased ? lastAttempt.passed : null,
                                resultsReleased: areResultsReleased
                            });
                            if (areResultsReleased && lastAttempt.answers) {
                                let parsed = lastAttempt.answers;
                                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                                if (parsed?.theory) setAnswers(parsed.theory);
                                if (parsed?.practical) localStorage.setItem(`practical_answers_${evaluationKey}`, JSON.stringify(parsed.practical));
                            }
                        } else if (localCompleted) {
                            setFinalizing(false);
                            setExamStarted(false);
                            const localReleased = isStaff || (evalObj.results_released !== 0 && evalObj.results_released !== false && localCompleted.resultsReleased !== false);
                            if (!isReviewRequested || !localReleased) {
                                setShowResults(true);
                                setReviewMode(false);
                            } else {
                                setReviewMode(true);
                                setShowResults(false);
                            }
                            setResult({
                                ...localCompleted,
                                score: localReleased ? localCompleted.score : null,
                                totalPts: localReleased ? localCompleted.totalPts : null,
                                resultsReleased: localReleased
                            });
                        } else {
                            // Si no hay intento completado, deshabilitar modo revisión para permitir rendir la prueba
                            setReviewMode(false);
                            setShowResults(false);
                        }
                    } catch (e) {
                        console.error('Error recuperando intento previo de D1:', e);
                        if (localCompleted) {
                            setFinalizing(false);
                            setExamStarted(false);
                            setShowResults(true);
                            setResult(localCompleted);
                        } else {
                            setReviewMode(false);
                            setShowResults(false);
                        }
                    }
                }
            } catch (err) {
                console.error('Error cargando evaluación:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluation();
    }, [evaluationKey]);

    const totalQuestions = questions.length;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ── 1. REGISTRAR INFRACCIÓN ANTITRAMPA ──
    const recordInfraction = (reason) => {
        if (!examStarted || showResults || reviewMode || finalizing) return;
        
        // Debounce de 1.5s para evitar eventos dobles
        const now = Date.now();
        if (now - lastInfractionTimeRef.current < 1500) return;
        lastInfractionTimeRef.current = now;

        const nextStrikes = strikes + 1;
        setStrikes(nextStrikes);
        localStorage.setItem(`exam_strikes_${evaluationKey}`, nextStrikes.toString());

        if (reason.toLowerCase().includes('pestaña') || reason.toLowerCase().includes('ventana') || reason.toLowerCase().includes('aplicación')) {
            const nextTabs = tabSwitches + 1;
            setTabSwitches(nextTabs);
            localStorage.setItem(`exam_tab_switches_${evaluationKey}`, nextTabs.toString());
        } else if (reason.toLowerCase().includes('pantalla')) {
            const nextFs = fullscreenExits + 1;
            setFullscreenExits(nextFs);
            localStorage.setItem(`exam_fs_exits_${evaluationKey}`, nextFs.toString());
        }

        playWarningBeep(nextStrikes >= 3);
        setStrikeModalData({ number: nextStrikes, reason });
        setShowStrikeModal(true);

        if (nextStrikes >= 3) {
            // Strike 3: Bloqueo total y auto-finalización por infracción
            setTimeout(() => {
                handleFinishExam(true, 'infraction');
            }, 2200);
        }
    };

    // ── 2. LISTENERS DE SEGURIDAD EN VIVO ──
    useEffect(() => {
        if (!examStarted || showResults || reviewMode || finalizing) return;

        // Detector de cambio de pestaña o minimizado
        const handleVisibilityChange = () => {
            if (document.hidden) {
                recordInfraction('Has cambiado de pestaña o minimizado el examen.');
            }
        };

        // Detector de pérdida de foco (otra aplicación)
        const handleWindowBlur = () => {
            if (!document.hidden) {
                recordInfraction('Has cambiado a otra ventana o aplicación externa.');
            }
        };

        // Detector de salida de pantalla completa
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !showStrikeModal) {
                recordInfraction('Has salido del modo Pantalla Completa obligatorio.');
            }
        };

        // Bloqueo de portapapeles
        const handleClipboard = (e) => {
            e.preventDefault();
        };

        // Bloqueo de menú contextual
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // Bloqueo de atajos clave (DevTools, Source, Print, Copy)
        const handleKeyDown = (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))) {
                e.preventDefault();
                recordInfraction('Intento de inspección / herramientas de desarrollador.');
                return;
            }
            if (e.ctrlKey && ['u', 'U', 'p', 'P', 's', 'S'].includes(e.key)) {
                e.preventDefault();
                return;
            }
            if (e.ctrlKey && ['c', 'C', 'v', 'V', 'x', 'X'].includes(e.key)) {
                e.preventDefault();
                return;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('copy', handleClipboard);
        document.addEventListener('cut', handleClipboard);
        document.addEventListener('paste', handleClipboard);
        document.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', handleClipboard);
            document.removeEventListener('cut', handleClipboard);
            document.removeEventListener('paste', handleClipboard);
            document.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [examStarted, showResults, reviewMode, finalizing, strikes, tabSwitches, fullscreenExits, showStrikeModal]);

    // ── 3. INICIO CON SEGURIDAD Y PANTALLA COMPLETA ──
    const startExamWithSecurity = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (e) {
            console.warn('Fullscreen request:', e);
        }

        const limitSeconds = (evaluation?.time_limit || 60) * 60;
        const now = Math.floor(Date.now() / 1000);
        const endTime = now + limitSeconds;
        setTimeLeft(limitSeconds);
        localStorage.setItem(`exam_end_time_${evaluationKey}`, endTime.toString());
        localStorage.setItem(`exam_started_${evaluationKey}`, 'true');
        setExamStarted(true);
    };

    useEffect(() => {
        if (!examStarted || showResults || reviewMode) return;

        const timerInterval = setInterval(() => {
            const savedEndTime = localStorage.getItem(`exam_end_time_${evaluationKey}`);
            if (!savedEndTime) return;
            const now = Math.floor(Date.now() / 1000);
            const remaining = parseInt(savedEndTime, 10) - now;
            
            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(timerInterval);
                if (!showResults && !reviewMode) {
                    handleAutoFinish();
                }
            } else {
                setTimeLeft(remaining);
                // Alerta de 3 minutos (180 segundos)
                if (remaining <= 180 && !hasShown3MinWarning) {
                    setShowTimeWarningModal(true);
                    setHasShown3MinWarning(true);
                }
            }
        }, 500);

        return () => clearInterval(timerInterval);
    }, [examStarted, showResults, reviewMode, evaluationKey, hasShown3MinWarning]);

    const handleAutoFinish = () => {
        if (!finalizing) {
            setFinalizing(true);
            setTimeout(() => {
                handleFinishExam(true);
            }, 1000);
        }
    };

    const saveAttemptToCloud = async (currentTheoryAnswers) => {
        if (!user || !user.id) return;
        setSyncStatus('saving');
        
        try {
            let correctCount = 0;
            questions.forEach((q, idx) => {
                const userAns = currentTheoryAnswers[idx];
                if (userAns !== undefined && userAns !== null && userAns !== '' && q.correct !== undefined && q.correct !== null) {
                    if (String(userAns).trim().toLowerCase() === String(q.correct).trim().toLowerCase()) {
                        correctCount++;
                    }
                }
            });

            let practicalAnswers = {};
            try {
                const saved = localStorage.getItem(`practical_answers_${evaluationKey}`);
                if (saved) practicalAnswers = JSON.parse(saved);
            } catch {
                // ignore
            }

            const calc = calculatePracticalScore(practicalAnswers);
            const isExamenL6 = evaluationKey === 'ee-m1-l6';
            const theoryPts = isExamenL6 ? (correctCount * 2) : Math.round((correctCount / (totalQuestions || 1)) * 100);
            const totalPts = isExamenL6 ? (theoryPts + calc.score) : theoryPts;
            const maxExamPts = isExamenL6 ? 150 : 100;
            const scorePct = Math.round((totalPts / maxExamPts) * 100);

            await api('/attempts', {
                method: 'POST',
                body: {
                    evaluation_key: evaluationKey,
                    answers: {
                        theory: currentTheoryAnswers,
                        practical: practicalAnswers,
                        anti_cheat: {
                            strikes: strikes,
                            tab_switches: tabSwitches,
                            fullscreen_exits: fullscreenExits,
                            status: strikes >= 3 ? 'infraction' : strikes > 0 ? 'warning' : 'clean'
                        }
                    },
                    score: scorePct,
                    points_obtained: totalPts,
                    max_points: maxExamPts,
                    passed: scorePct >= (evaluation?.passing_score || 70),
                    completed_at: null
                }
            });

            setSyncStatus('saved');
        } catch (err) {
            console.error('Error auto-guardado en tiempo real:', err);
            setSyncStatus('error');
        }
    };

    const handleAnswer = (answerValue) => {
        if (reviewMode || showResults) return;
        const newAnswers = { ...answers, [currentQuestion]: answerValue };
        setAnswers(newAnswers);
        setExamStarted(true);
        localStorage.setItem(`exam_answers_${evaluationKey}`, JSON.stringify(newAnswers));
        
        // Guardado instantáneo en la nube
        saveAttemptToCloud(newAnswers);

        // Avance automático a la siguiente pregunta tras breve pausa
        if (currentQuestion < totalQuestions - 1) {
            setTimeout(() => {
                setCurrentQuestion(prev => Math.min(prev + 1, totalQuestions - 1));
            }, 300);
        }
    };

    const handleNext = () => {
        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleQuestionClick = (index) => {
        setCurrentQuestion(index);
    };

    const handleResetAttempt = async () => {
        const confirmMsg = isStaff
            ? '¿Deseas restablecer este intento como Docente/Admin? Se eliminará el registro de finalización y podrás realizar el examen nuevamente desde cero.'
            : '¿Deseas restablecer este intento? Se borrará el registro anterior y podrás volver a realizar la evaluación.';
        if (!window.confirm(confirmMsg)) return;

        try {
            await api(`/attempts?evaluation_key=${encodeURIComponent(evaluationKey)}`, { method: 'DELETE' });
        } catch (e) {
            console.error('Error eliminando intento en la base de datos:', e);
        }

        const normKey = (evaluationKey || '').toLowerCase();
        localStorage.removeItem(`exam_completed_${evaluationKey}`);
        localStorage.removeItem(`exam_completed_${normKey}`);
        localStorage.removeItem(`exam_answers_${evaluationKey}`);
        localStorage.removeItem(`exam_started_${evaluationKey}`);
        localStorage.removeItem(`exam_end_time_${evaluationKey}`);
        localStorage.removeItem(`exam_current_q_${evaluationKey}`);
        localStorage.removeItem(`exam_shuffled_questions_${evaluationKey}`);
        localStorage.removeItem(`exam_strikes_${evaluationKey}`);
        localStorage.removeItem(`exam_infractions_${evaluationKey}`);
        localStorage.removeItem(`practical_answers_${evaluationKey}`);
        localStorage.removeItem(`practical_answers_${normKey}`);
        localStorage.removeItem(`exam_flagged_${evaluationKey}`);

        setShowResults(false);
        setReviewMode(false);
        setResult(null);
        setAnswers({});
        setFlaggedQuestions({});
        setStrikes(0);
        setCurrentQuestion(0);
        setExamStarted(false);
        window.location.href = `/dashboard/evaluations/${evaluationKey}`;
    };

    const handleResetAnswers = () => {
        if (window.confirm('¿Deseas borrar todas las respuestas seleccionadas y reiniciar el examen desde la primera pregunta?')) {
            localStorage.removeItem(`exam_answers_${evaluationKey}`);
            localStorage.removeItem(`exam_current_q_${evaluationKey}`);
            localStorage.removeItem(`exam_flagged_${evaluationKey}`);
            setAnswers({});
            setFlaggedQuestions({});
            setCurrentQuestion(0);
        }
    };

    const handleFinishExam = async (isAuto = false, infractionType = null) => {
        setShowConfirmSubmitModal(false);

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        setFinalizing(true);

        let correctCount = 0;
        questions.forEach((q, idx) => {
            const userAns = answers[idx];
            if (userAns !== undefined && userAns !== null && userAns !== '' && q.correct !== undefined && q.correct !== null) {
                if (String(userAns).trim().toLowerCase() === String(q.correct).trim().toLowerCase()) {
                    correctCount++;
                }
            }
        });

        const normKey = String(evaluationKey || '').toLowerCase();
        const isExamenL6 = normKey === 'ee-m1-l6';
        let currentPracticalScore = 0;
        let practicalAnswers = {};
        try {
            const saved = localStorage.getItem(`practical_answers_${normKey}`) || 
                          localStorage.getItem(`practical_answers_${evaluationKey}`) ||
                          localStorage.getItem('practical_answers_ee-m1-l6') ||
                          localStorage.getItem('practical_answers_EE-M1-L6');
            if (saved) practicalAnswers = JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }

        if (isExamenL6) {
            const calc = calculatePracticalScore(practicalAnswers);
            currentPracticalScore = calc.score;
        }

        const theoryPts = isExamenL6 ? (correctCount * 2) : Math.round((correctCount / (totalQuestions || 1)) * 100);
        const maxTheoryPts = isExamenL6 ? 60 : 100;
        const maxExamPts = isExamenL6 ? 150 : 100;
        const totalPts = isExamenL6 ? (theoryPts + currentPracticalScore) : theoryPts;
        const scorePct = Math.round((totalPts / maxExamPts) * 100);
        const passed = scorePct >= (evaluation?.passing_score || 70);
        const integrityStatus = infractionType === 'infraction' || strikes >= 3 ? 'infraction' : strikes > 0 ? 'warning' : 'clean';

        try {
            const res = await api('/attempts', {
                method: 'POST',
                body: {
                    evaluation_key: evaluationKey,
                    answers: {
                        theory: answers,
                        practical: practicalAnswers,
                        anti_cheat: {
                            strikes: strikes,
                            tab_switches: tabSwitches,
                            fullscreen_exits: fullscreenExits,
                            status: integrityStatus
                        }
                    },
                    score: scorePct,
                    points_obtained: totalPts,
                    max_points: maxExamPts,
                    passed: passed,
                    completed_at: new Date().toISOString()
                }
            });

            const isResultsReleased = isStaff || (evaluation?.results_released !== false && evaluation?.results_released !== 0 && res?.data?.results_released !== false);

            setResult({ 
                score: isResultsReleased ? scorePct : null, 
                totalPts: isResultsReleased ? totalPts : null, 
                maxExamPts, 
                theoryPts: isResultsReleased ? theoryPts : null, 
                maxTheoryPts, 
                practicalScore: isResultsReleased ? currentPracticalScore : null, 
                correctCount: isResultsReleased ? correctCount : null, 
                totalQuestions, 
                passed: isResultsReleased ? passed : null,
                integrityStatus,
                resultsReleased: isResultsReleased
            });
            setShowResults(true);
            setFinalizing(false);
            
            // Guardar marcador de finalización en cliente y base de datos
            const completionRecord = {
                score: isResultsReleased ? scorePct : null,
                points_obtained: isResultsReleased ? totalPts : null,
                max_points: maxExamPts,
                passed: isResultsReleased ? passed : null,
                integrityStatus: integrityStatus,
                completed_at: new Date().toISOString(),
                resultsReleased: isResultsReleased
            };
            localStorage.setItem(`exam_completed_${normKey}`, JSON.stringify(completionRecord));
            localStorage.setItem(`exam_completed_${evaluationKey}`, JSON.stringify(completionRecord));
            localStorage.setItem('exam_completed_ee-m1-l6', JSON.stringify(completionRecord));

            // Limpieza de sesión activa
            localStorage.removeItem(`exam_end_time_${evaluationKey}`);
            localStorage.removeItem(`exam_started_${evaluationKey}`);
            localStorage.removeItem(`exam_shuffled_questions_${evaluationKey}`);
            localStorage.removeItem(`exam_current_q_${evaluationKey}`);
            localStorage.removeItem(`exam_active_phase_${evaluationKey}`);
            localStorage.removeItem(`exam_flagged_${evaluationKey}`);
            
        } catch (error) {
            console.error('Error guardando intento:', error);
            setFinalizing(false);
            if (!isAuto) alert('Hubo un error al guardar tus resultados. Por favor, intenta de nuevo.');
        } finally {
            setFinalizing(false);
        }
    };

    if (loading) {
        return <div className="notifications-page"><div className="page-header"><h1>Cargando...</h1></div></div>;
    }

    if (!evaluation) {
        return <div className="notifications-page"><div className="page-header"><h1>Evaluación no encontrada</h1></div></div>;
    }

    if (questions.length === 0) {
        return (
            <div className="notifications-page">
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>Sin Preguntas</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Esta evaluación aún no tiene preguntas publicadas por el docente.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!examStarted && !reviewMode && !showResults) {
        return (
            <div className="notifications-page">
                <div className="security-gate-wrapper">
                    <div className="security-gate-icon-halo">
                        <ShieldAlert size={42} color="#38bdf8" />
                    </div>

                    <h1 className="security-gate-title">Protocolo de Seguridad y Antitrampa</h1>
                    <p className="security-gate-subtitle">
                        Estás a punto de iniciar la prueba oficial <strong>{evaluation.title}</strong>. Para garantizar la validez académica y la integridad de tu certificación, el sistema activará la supervisión en tiempo real.
                    </p>

                    <div className="security-rules-grid">
                        <div className="security-rule-card">
                            <span className="rule-icon">🖥️</span>
                            <div>
                                <h4 className="rule-title">Pantalla Completa Obligatoria</h4>
                                <p className="rule-desc">La prueba debe realizarse en pantalla completa continua. Salir registrará una infracción.</p>
                            </div>
                        </div>

                        <div className="security-rule-card">
                            <span className="rule-icon">👁️</span>
                            <div>
                                <h4 className="rule-title">Detección de Pestañas y Apps</h4>
                                <p className="rule-desc">Cambiar de pestaña, minimizar el navegador o abrir otra app sumará un strike de advertencia.</p>
                            </div>
                        </div>

                        <div className="security-rule-card">
                            <span className="rule-icon">🔒</span>
                            <div>
                                <h4 className="rule-title">Bloqueo de Portapapeles</h4>
                                <p className="rule-desc">Copiar, pegar, clic derecho e inspección de código están completamente inhabilitados.</p>
                            </div>
                        </div>

                        <div className="security-rule-card">
                            <span className="rule-icon">⚠️</span>
                            <div>
                                <h4 className="rule-title">Límite de 3 Strikes</h4>
                                <p className="rule-desc">Al acumular 3 infracciones, el examen se bloqueará y auto-enviará inmediatamente al docente.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="security-start-btn"
                            onClick={startExamWithSecurity}
                        >
                            <Maximize size={20} />
                            <span>Aceptar Protocolo e Iniciar Examen en Pantalla Completa</span>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: '#cbd5e1',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                padding: '1rem 1.75rem',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.95rem'
                            }}
                        >
                            Cancelar y Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        const isResultsProtected = !isStaff && (evaluation?.results_released === false || evaluation?.results_released === 0 || result?.resultsReleased === false);

        if (isResultsProtected) {
            return (
                <div className="notifications-page">
                    <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '650px', margin: '2rem auto', borderRadius: '24px', border: '1.5px solid var(--border-default)' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '24px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '2px solid #10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)'
                        }}>
                            <CheckCircle2 size={46} color="#10b981" />
                        </div>

                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                            ¡Examen Enviado con Éxito!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
                            Tus respuestas para <strong style={{ color: 'var(--text-primary)' }}>{evaluation.title}</strong> han sido consolidadas y almacenadas con sello temporal en el servidor.
                        </p>

                        <div style={{
                            background: 'var(--surface-card-subtle)',
                            border: '1.5px solid var(--border-default)',
                            borderRadius: '18px',
                            padding: '1.5rem',
                            marginBottom: '2.25rem',
                            textAlign: 'left',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', color: 'var(--brand-primary)', fontWeight: 800 }}>
                                <Lock size={20} />
                                <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calificaciones y Solucionario Protegidos</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, lineHeight: '1.6' }}>
                                El docente ha establecido que la retroalimentación detallada y el puntaje oficial se publicarán una vez culmine la sesión de evaluación para todo el grupo. Podrás consultar tu calificación y el solucionario ingresando nuevamente a este enlace cuando las notas sean liberadas.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2.5rem',
                                borderRadius: '14px',
                                fontWeight: 800,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.4)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="notifications-page">
                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '650px', margin: '2rem auto', borderRadius: '24px', border: '1.5px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '22px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1.5px solid rgba(56, 189, 248, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <Award size={40} color="var(--brand-primary)" />
                    </div>

                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        ¡Examen Terminado!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
                        Has completado exitosamente <strong style={{ color: 'var(--text-primary)' }}>{evaluation.title}</strong>
                    </p>

                    <div style={{
                        background: 'var(--surface-card-subtle)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        marginBottom: '2rem',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {/* 1. DESGLOSE TEÓRICO Y PRÁCTICO (ARRIBA) */}
                        {isExamenL6 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                                <div style={{ background: 'var(--surface-card)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '1rem', borderRadius: '14px' }}>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 800, letterSpacing: '0.5px' }}>PARTE TEÓRICA</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.25rem 0' }}>{result?.theoryPts} / 60 pts</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{result?.correctCount} de 30 preguntas</div>
                                </div>
                                <div style={{ background: 'var(--surface-card)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '14px' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 800, letterSpacing: '0.5px' }}>PARTE PRÁCTICA</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.25rem 0' }}>{result?.practicalScore} / 90 pts</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Red Mixta 8 Resistores</div>
                                </div>
                            </div>
                        )}

                        {/* 2. TOTAL CONSOLIDADO (ABAJO) */}
                        <div style={{
                            paddingTop: isExamenL6 ? '1.5rem' : 0,
                            borderTop: isExamenL6 ? '1px solid var(--border-subtle)' : 'none'
                        }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                                PUNTAJE TOTAL OBTENIDO
                            </div>
                            <div style={{
                                fontSize: '3.5rem',
                                fontWeight: 900,
                                color: 'var(--brand-primary)',
                                fontFamily: 'monospace'
                            }}>
                                {result?.totalPts ?? result?.score} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/ {result?.maxExamPts || 100} pts</span>
                            </div>
                            
                            {/* Insignia de Integridad */}
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <div className={`anticheat-hud-badge ${result?.integrityStatus === 'infraction' || strikes >= 3 ? 'danger' : result?.integrityStatus === 'warning' || strikes > 0 ? 'warning' : ''}`}>
                                    <ShieldCheck size={14} />
                                    <span>
                                        {result?.integrityStatus === 'infraction' || strikes >= 3 
                                            ? 'AUDITORÍA: FINALIZADO CON INFRACCIONES' 
                                            : result?.integrityStatus === 'warning' || strikes > 0 
                                                ? `AUDITORÍA: COMPLETADO CON ${strikes} ADVERTENCIA(S)` 
                                                : 'AUDITORÍA: 100% ÍNTEGRO (SIN INCIDENCIAS)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                setShowResults(false);
                                setReviewMode(true);
                                setActivePhase('teoria');
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.9rem 2rem',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                fontWeight: 900,
                                fontSize: '1rem',
                                boxShadow: '0 4px 18px rgba(2, 132, 199, 0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isExamenL6 ? '🔍 Revisar Examen (Teoría y Práctica)' : '🔍 Revisar Examen'}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'var(--surface-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-default)',
                                padding: '0.9rem 2rem',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '1rem',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Volver al Inicio
                        </button>

                        {isStaff && (
                            <button
                                onClick={handleResetAttempt}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#ef4444',
                                    border: '1.5px dashed rgba(239, 68, 68, 0.4)',
                                    padding: '0.9rem 1.75rem',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    width: '100%',
                                    marginTop: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                                title="Eliminar registro de examen completado para volver a rendirlo"
                            >
                                🔄 Restablecer Intento (Modo Docente / Admin)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (reviewMode && !isStaff && (evaluation?.results_released === false || evaluation?.results_released === 0 || result?.resultsReleased === false)) {
        return (
            <div className="notifications-page">
                <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto', borderRadius: '24px', border: '1.5px solid rgba(239, 68, 68, 0.4)', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1.5px solid rgba(239, 68, 68, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <Lock size={38} color="#ef4444" />
                    </div>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.75rem' }}>
                        Solucionario Protegido
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                        El docente ha establecido que la retroalimentación y las respuestas correctas de esta prueba se habilitarán una vez concluya el periodo de examen de todos los estudiantes del curso.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'var(--brand-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.85rem 2rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '0.95rem'
                        }}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const userAnswer = answers[currentQuestion];

    const answeredCount = Object.values(answers).filter(v => v !== undefined && v !== null && v !== '').length;
    const correctCount = questions.filter((q, idx) => {
        const userAns = answers[idx];
        if (userAns === undefined || userAns === null || userAns === '') return false;
        if (q?.correct === undefined || q?.correct === null || q?.correct === '') return false;
        return String(userAns).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
    }).length;
    const theoryPts = isExamenL6 ? (correctCount * 2) : Math.round((correctCount / (totalQuestions || 1)) * 100);

    return (
        <div className="notifications-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Modal de Confirmación y Desglose Previo a la Entrega Definitiva */}
            {showConfirmSubmitModal && (
                <div className="submit-confirm-overlay">
                    <div className="submit-confirm-modal">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '14px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#38bdf8'
                            }}>
                                <Award size={26} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc' }}>
                                    ¿Confirmar entrega definitiva?
                                </h3>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                                    Revisa el resumen de tus respuestas antes de consolidar el intento oficial.
                                </p>
                            </div>
                        </div>

                        <div className="submit-stats-grid">
                            <div className="submit-stat-box">
                                <div className="submit-stat-val" style={{ color: '#10b981' }}>
                                    {answeredCount} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {totalQuestions}</span>
                                </div>
                                <div className="submit-stat-lbl">Respondidas</div>
                            </div>

                            <div className="submit-stat-box">
                                <div className="submit-stat-val" style={{ color: (totalQuestions - answeredCount) > 0 ? '#ef4444' : '#10b981' }}>
                                    {totalQuestions - answeredCount}
                                </div>
                                <div className="submit-stat-lbl">Sin responder</div>
                            </div>

                            <div className="submit-stat-box">
                                <div className="submit-stat-val" style={{ color: '#fbbf24' }}>
                                    {Object.values(flaggedQuestions).filter(Boolean).length}
                                </div>
                                <div className="submit-stat-lbl">Marcadas 🚩</div>
                            </div>

                            <div className="submit-stat-box">
                                <div className="submit-stat-val" style={{ color: timeLeft <= 180 ? '#ef4444' : '#38bdf8', fontFamily: 'monospace' }}>
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="submit-stat-lbl">Tiempo Restante</div>
                            </div>
                        </div>

                        {(totalQuestions - answeredCount) > 0 && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '12px',
                                padding: '0.8rem 1rem',
                                marginBottom: '1rem',
                                fontSize: '0.86rem',
                                color: '#fca5a5',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.55rem'
                            }}>
                                <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                                <span>Tienes <strong>{totalQuestions - answeredCount}</strong> pregunta(s) sin responder. Las preguntas en blanco se calificarán con 0 puntos.</span>
                            </div>
                        )}

                        {Object.values(flaggedQuestions).filter(Boolean).length > 0 && (
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '12px',
                                padding: '0.8rem 1rem',
                                marginBottom: '1rem',
                                fontSize: '0.86rem',
                                color: '#fcd34d',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.55rem'
                            }}>
                                <Flag size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                                <span>Tienes <strong>{Object.values(flaggedQuestions).filter(Boolean).length}</strong> pregunta(s) marcadas para revisión.</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setShowConfirmSubmitModal(false)}
                                style={{
                                    padding: '0.8rem 1.4rem',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '12px',
                                    color: '#cbd5e1',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Continuar respondiendo
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowConfirmSubmitModal(false);
                                    handleFinishExam(true);
                                }}
                                style={{
                                    padding: '0.8rem 1.6rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#ffffff',
                                    fontSize: '0.92rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Entregar Examen Definitivo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Strike Antitrampa en Pantalla Completa */}
            {showStrikeModal && (
                <div className="strike-modal-overlay">
                    <div className={`strike-modal-card ${strikeModalData.number < 3 ? 'warning-level' : ''}`}>
                        <div className="strike-icon-wrapper">
                            {strikeModalData.number >= 3 ? <AlertOctagon size={38} color="#ef4444" /> : <ShieldAlert size={38} color="#f59e0b" />}
                        </div>

                        <div className="strike-pills-row">
                            <span className={`strike-pip ${strikeModalData.number >= 1 ? (strikeModalData.number >= 3 ? 'active' : 'active-warn') : ''}`}>STRIKE 1</span>
                            <span className={`strike-pip ${strikeModalData.number >= 2 ? (strikeModalData.number >= 3 ? 'active' : 'active-warn') : ''}`}>STRIKE 2</span>
                            <span className={`strike-pip ${strikeModalData.number >= 3 ? 'active' : ''}`}>STRIKE 3 (BLOQUEO)</span>
                        </div>

                        <h2 className="strike-title">
                            {strikeModalData.number >= 3 ? '⛔ EXAMEN BLOQUEADO' : `⚠️ ADVERTENCIA ${strikeModalData.number}/3`}
                        </h2>

                        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
                            {strikeModalData.number >= 3 
                                ? 'Has acumulado 3 infracciones de seguridad. Tu examen ha sido finalizado automáticamente.'
                                : 'Se ha detectado una salida del entorno de evaluación seguro.'}
                        </p>

                        <div className="strike-reason-box">
                            <strong>Motivo:</strong> {strikeModalData.reason}
                        </div>

                        {strikeModalData.number < 3 ? (
                            <button
                                className="strike-resume-btn"
                                onClick={async () => {
                                    setShowStrikeModal(false);
                                    try {
                                        if (!document.fullscreenElement) {
                                            await document.documentElement.requestFullscreen();
                                        }
                                    } catch {}
                                }}
                            >
                                <Maximize size={18} />
                                <span>Reanudar Examen en Pantalla Completa</span>
                            </button>
                        ) : (
                            <p style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.9rem' }}>
                                Consolidando y enviando resultados con reporte de auditoría...
                            </p>
                        )}
                    </div>
                </div>
            )}

            {finalizing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="loading-spinner-large" style={{ marginBottom: '1.5rem' }}></div>
                    <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Consolidando Examen</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Guardando respuestas teóricas y prácticas en la nube...</p>
                </div>
            )}
            
            {/* Header del Examen Oficial */}
            <div className="page-header" style={{ marginBottom: '1.25rem' }}>
                <div className="eval-header-top" style={{ margin: 0 }}>
                    <div>
                        <div className="eval-header-badge">EVALUACIÓN OFICIAL</div>
                        <h1 className="eval-header-title">{evaluation.title}</h1>
                    </div>
                </div>

                <div className="glass-panel" style={{ 
                    padding: '0.75rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.25rem',
                    borderRadius: '12px'
                }}>
                    {/* Badge de Supervisión Antitrampa o Modo Revisión */}
                    {reviewMode ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            color: '#38bdf8',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            letterSpacing: '0.5px'
                        }}>
                            <Eye size={14} />
                            <span>MODO REVISIÓN (SOLO LECTURA)</span>
                        </div>
                    ) : (
                        <div className={`anticheat-hud-badge ${strikes >= 2 ? 'danger' : strikes > 0 ? 'warning' : ''}`}>
                            <div className="hud-pulse-dot"></div>
                            <ShieldAlert size={14} />
                            <span>SUPERVISIÓN: {strikes}/3 STRIKES</span>
                        </div>
                    )}

                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>

                    {reviewMode ? (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: '#10b981'
                        }}>
                            <Award size={18} color="#10b981" />
                            <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: '0.95rem'
                            }}>
                                FINALIZADO
                            </span>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: timeLeft <= 180 ? '#ef4444' : '#f8fafc',
                            background: timeLeft <= 180 ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            padding: timeLeft <= 180 ? '0.3rem 0.6rem' : 0,
                            borderRadius: '8px',
                            border: timeLeft <= 180 ? '1px solid rgba(239, 68, 68, 0.4)' : 'none'
                        }}>
                            <Clock size={18} color={timeLeft <= 180 ? '#ef4444' : '#38bdf8'} />
                            <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: '1.1rem',
                                fontFamily: 'monospace'
                            }}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}

                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!isOnline ? (
                            <>
                                <WifiOff size={15} color="#ef4444" />
                                <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>Sin conexión (Local)</span>
                            </>
                        ) : syncStatus === 'saving' ? (
                            <>
                                <div className="loading-spinner-tiny"></div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Sincronizando...</span>
                            </>
                        ) : syncStatus === 'error' ? (
                            <>
                                <AlertTriangle size={15} color="#f59e0b" />
                                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>Reintentando sync...</span>
                            </>
                        ) : (
                            <>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>En línea (Sync OK)</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Banner Flotante de Últimos 3 Minutos */}
            {timeLeft > 0 && timeLeft <= 180 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)',
                    color: '#ffffff',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '14px',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.45)',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <AlertTriangle size={22} color="#ffffff" />
                        <span>⏳ ¡ÚLTIMOS 3 MINUTOS! Revisa tus respuestas y asegúrate de completar ambas fases. El examen se entregará automáticamente en <strong>{formatTime(timeLeft)}</strong>.</span>
                    </div>
                </div>
            )}

            {/* Selector de Fase Teórica vs. Práctica (Para Exámenes Integrales como L6) */}
            {isExamenL6 && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setActivePhase('teoria')}
                        style={{
                            flex: 1,
                            minWidth: '280px',
                            padding: '0.9rem 1.25rem',
                            borderRadius: '14px',
                            border: 'none',
                            background: activePhase === 'teoria' ? '#38bdf8' : 'rgba(30, 41, 59, 0.7)',
                            color: activePhase === 'teoria' ? '#0f172a' : '#cbd5e1',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.6rem',
                            transition: 'all 0.2s ease',
                            boxShadow: activePhase === 'teoria' ? '0 4px 20px rgba(56, 189, 248, 0.3)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={20} />
                            <span>Fase 1: Teoría Conceptual (60 Pts)</span>
                        </div>
                        <span style={{
                            background: activePhase === 'teoria' ? '#0f172a' : 'rgba(255,255,255,0.1)',
                            color: activePhase === 'teoria' ? '#38bdf8' : '#cbd5e1',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 900
                        }}>
                            {(reviewMode || showResults) ? `✓ ${correctCount * 2}/60 Pts` : `${answeredCount}/30 Resp.`}
                        </span>
                    </button>

                    <button
                        onClick={() => setActivePhase('practica')}
                        style={{
                            flex: 1,
                            minWidth: '280px',
                            padding: '0.9rem 1.25rem',
                            borderRadius: '14px',
                            border: 'none',
                            background: activePhase === 'practica' ? '#f59e0b' : 'rgba(30, 41, 59, 0.7)',
                            color: activePhase === 'practica' ? '#0f172a' : '#cbd5e1',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.6rem',
                            transition: 'all 0.2s ease',
                            boxShadow: activePhase === 'practica' ? '0 4px 20px rgba(245, 158, 11, 0.3)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} />
                            <span>Fase 2: Red Mixta Práctica (90 Pts)</span>
                        </div>
                        <span style={{
                            background: activePhase === 'practica' ? '#0f172a' : 'rgba(255,255,255,0.1)',
                            color: activePhase === 'practica' ? '#fbbf24' : '#cbd5e1',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 900
                        }}>
                            {(reviewMode || showResults) ? `⚡ ${practicalScore}/90 Pts` : (practicalScore > 0 ? `⚡ ${practicalScore}/90 Pts` : '⚡ 90 Pts')}
                        </span>
                    </button>
                </div>
            )}

            {/* CONTENIDO SEGÚN LA FASE ACTIVA */}
            {(!isExamenL6 || activePhase === 'teoria') ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.45fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    <div>
                        <QuestionNavigator
                            questions={questions}
                            currentQuestion={currentQuestion}
                            answers={answers}
                            flaggedQuestions={flaggedQuestions}
                            onQuestionClick={handleQuestionClick}
                            showFeedback={reviewMode || showResults}
                        />
                        {!reviewMode && !showResults && isStaff && Object.keys(answers).length > 0 && (
                            <button
                                onClick={handleResetAnswers}
                                style={{
                                    width: '100%',
                                    marginTop: '0.75rem',
                                    padding: '0.65rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    color: '#f87171',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                title="Borrar respuestas marcadas y comenzar desde la pregunta 1"
                            >
                                🔄 Reiniciar respuestas ({Object.keys(answers).length})
                            </button>
                        )}
                    </div>

                    <div style={{ width: '100%' }}>
                        <QuestionPanel
                            currentQuestion={currentQuestion}
                            totalQuestions={totalQuestions}
                            question={currentQ}
                            userAnswer={userAnswer}
                            onAnswer={handleAnswer}
                            showFeedback={reviewMode || showResults}
                            isFlagged={Boolean(flaggedQuestions[currentQuestion])}
                            onToggleFlag={handleToggleFlag}
                        />

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={handlePrev}
                                disabled={currentQuestion === 0}
                                style={{
                                    padding: '0.85rem 1.75rem',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '12px',
                                    background: 'var(--surface-card)',
                                    color: 'var(--text-primary)',
                                    cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentQuestion === 0 ? 0.4 : 1,
                                    flex: 1,
                                    minWidth: '130px',
                                    maxWidth: '220px',
                                    fontWeight: 800,
                                    textAlign: 'center',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                ⬅ Anterior
                            </button>

                            {currentQuestion < totalQuestions - 1 ? (
                                <button
                                    onClick={handleNext}
                                    style={{
                                        padding: '0.85rem 1.75rem',
                                        border: 'none',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        flex: 1,
                                        fontWeight: 800,
                                        minWidth: '130px',
                                        maxWidth: '220px',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)'
                                    }}
                                >
                                    Siguiente ➔
                                </button>
                            ) : (
                                <button
                                    onClick={isExamenL6 ? () => setActivePhase('practica') : (reviewMode ? () => navigate('/dashboard') : () => setShowConfirmSubmitModal(true))}
                                    style={{
                                        padding: '0.85rem 2rem',
                                        border: 'none',
                                        borderRadius: '12px',
                                        background: reviewMode 
                                            ? 'linear-gradient(135deg, #0284c7, #0369a1)' 
                                            : 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        flex: 1.5,
                                        fontWeight: 900,
                                        minWidth: '200px',
                                        maxWidth: '280px',
                                        textAlign: 'center',
                                        boxShadow: reviewMode 
                                            ? '0 4px 16px rgba(2, 132, 199, 0.4)' 
                                            : '0 4px 16px rgba(16, 185, 129, 0.4)'
                                    }}
                                >
                                    {isExamenL6 ? (reviewMode ? 'Ir a Fase Práctica ➔' : 'Terminar Teórico ➔') : (reviewMode ? 'Salir a Evaluaciones' : 'Finalizar Evaluación')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* FASE PRÁCTICA DEL EXAMEN */
                <div>
                    <PracticalLabL6 showFeedback={reviewMode} />

                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setActivePhase('teoria')}
                            style={{
                                padding: '0.9rem 2rem',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                background: '#1e293b',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '1rem',
                                minWidth: '220px',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                            }}
                        >
                            ⬅ Volver a Fase Teórica
                        </button>
                        {reviewMode ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    padding: '0.9rem 2rem',
                                    border: '1px solid #38bdf8',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    minWidth: '220px',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)'
                                }}
                            >
                                Salir a Evaluaciones
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowConfirmSubmitModal(true)}
                                style={{
                                    padding: '0.9rem 2.2rem',
                                    border: 'none',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    minWidth: '240px',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                Finalizar y Entregar Examen (150 Pts)
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Resumen y Transición de la Fase Teórica */}
            {showTheorySummary && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1500,
                    padding: '1.5rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                        border: '1.5px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '24px',
                        padding: '2.5rem 2rem',
                        maxWidth: '520px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
                    }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '20px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem'
                        }}>
                            <Award size={36} color="#38bdf8" />
                        </div>

                        <h2 style={{ color: '#f8fafc', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
                            ¡Resultado de la Fase Teórica!
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '0 0 1.5rem', lineHeight: '1.5' }}>
                            Has completado la revisión de las 30 preguntas conceptuales del Módulo 1.
                        </p>

                        <div style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            marginBottom: '1.75rem'
                        }}>
                            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                                {correctCount * 2} <span style={{ fontSize: '1.3rem', color: '#94a3b8' }}>/ 60 Pts</span>
                            </div>
                            <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.95rem', marginTop: '0.25rem' }}>
                                {correctCount} de 30 preguntas correctas
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    setShowTheorySummary(false);
                                    setActivePhase('practica');
                                }}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: '#0f172a',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                ⚡ Continuar a Fase 2: Red Mixta Práctica (+90 Pts) 👉
                            </button>

                            <button
                                onClick={() => {
                                    setReviewMode(true);
                                    setShowTheorySummary(false);
                                }}
                                style={{
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    color: '#38bdf8',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                🔍 Ver Correcciones de mis Respuestas (Modo Revisión)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alerta de 3 Minutos Restantes */}
            {showTimeWarningModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2500,
                    padding: '1.5rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
                        border: '2px solid #ef4444',
                        borderRadius: '24px',
                        padding: '2.5rem 2rem',
                        maxWidth: '480px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(239, 68, 68, 0.4)'
                    }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '22px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1.5px solid rgba(239, 68, 68, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem'
                        }}>
                            <Clock size={40} color="#ef4444" />
                        </div>

                        <h2 style={{ color: '#f8fafc', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
                            ⏳ ¡Quedan 3 Minutos!
                        </h2>
                        <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: '0 0 1.75rem', lineHeight: '1.6' }}>
                            El tiempo de tu examen oficial está por terminar. Revisa tus respuestas y asegúrate de completar ambas fases antes de que el reloj llegue a <strong>00:00</strong>.
                        </p>

                        <button
                            onClick={() => setShowTimeWarningModal(false)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            ¡Entendido, continuar con el examen! ⚡
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationPlayer;
