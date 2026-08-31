import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    completeLearningSession,
    createLearningSession,
    saveQuizQuestionEvents,
    upsertConceptMasteryFromQuizResponses
} from '../lib/learningAnalytics';
import { ensureStudentProfile, saveQuizAttempt, upsertLessonProgress } from '../lib/studentProgress';

export const useLessonQuiz = ({
    user,
    lessonKey,
    lessonTitle,
    lessonQuestions = [],
    quizConfig = {},
    moduleId,
    lessonId
}) => {
    const [timeLeft, setTimeLeft] = useState(quizConfig.timePerQuestion ?? 20);
    const [quizMode, setQuizMode] = useState('intro');
    const [currentQ, setCurrentQ] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    const timerRef = useRef(null);
    const questionStartedAtRef = useRef(null);
    const quizStartedAtRef = useRef(null);
    const sessionIdRef = useRef(null);
    const quizPersistedRef = useRef(false);
    const handleQuizAnswerRef = useRef(() => { });

    const quizTimeLimit = quizConfig.timePerQuestion ?? 20;
    const requiredScorePercent = quizConfig.requiredScorePercent ?? 80;
    const courseId = lessonKey?.split('-')?.[0] ?? null;

    const questionTimeSegments = useMemo(
        () => Math.min(quizTimeLimit, 30),
        [quizTimeLimit]
    );

    const questionTimeFill = useMemo(() => {
        if (questionTimeSegments <= 0 || quizTimeLimit <= 0) return 0;
        return Math.ceil((timeLeft / quizTimeLimit) * questionTimeSegments);
    }, [questionTimeSegments, quizTimeLimit, timeLeft]);

    const resultPercent = useMemo(() => {
        if (!lessonQuestions.length) return 0;
        return Math.round((quizScore / lessonQuestions.length) * 100);
    }, [lessonQuestions.length, quizScore]);

    const persistQuizAttempt = useCallback(async (responsesSnapshot, scoreSnapshot) => {
        if (!user?.id || !lessonKey || quizPersistedRef.current) return;

        quizPersistedRef.current = true;

        const finishedAt = Date.now();
        const totalQuestions = lessonQuestions.length;
        const totalCorrect = scoreSnapshot;
        const timedOutCount = responsesSnapshot.filter((response) => response.timed_out).length;
        const totalDurationMs = quizStartedAtRef.current ? finishedAt - quizStartedAtRef.current : 0;
        const scorePercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        const attemptPayload = {
            version: 1,
            quiz_title: quizConfig.title || lessonTitle || 'Quiz',
            module_id: moduleId,
            lesson_route_id: lessonId,
            lesson_key: lessonKey,
            time_per_question_seconds: quizTimeLimit,
            required_score_percent: requiredScorePercent,
            started_at: quizStartedAtRef.current ? new Date(quizStartedAtRef.current).toISOString() : null,
            finished_at: new Date(finishedAt).toISOString(),
            total_duration_ms: totalDurationMs,
            score_raw: totalCorrect,
            total_questions: totalQuestions,
            score_percent: scorePercent,
            timed_out_count: timedOutCount,
            responses: responsesSnapshot
        };

        try {
            await ensureStudentProfile(user);
            const savedAttempt = await saveQuizAttempt({
                user_id: user.id,
                lesson_id: lessonKey,
                session_id: sessionIdRef.current,
                started_at: attemptPayload.started_at,
                finished_at: attemptPayload.finished_at,
                duration_ms: totalDurationMs,
                analytics_version: 1,
                score: scorePercent,
                answers: attemptPayload,
                metadata: {
                    module_id: moduleId,
                    lesson_route_id: lessonId,
                    quiz_title: attemptPayload.quiz_title,
                    score_raw: totalCorrect,
                    total_questions: totalQuestions
                }
            });

            await saveQuizQuestionEvents({
                attemptId: savedAttempt?.id,
                sessionId: sessionIdRef.current,
                userId: user.id,
                lessonId: lessonKey,
                responses: responsesSnapshot
            });

            await upsertConceptMasteryFromQuizResponses({
                userId: user.id,
                lessonId: lessonKey,
                courseId,
                responses: responsesSnapshot
            });

            await upsertLessonProgress({
                user_id: user.id,
                lesson_id: lessonKey,
                status: scorePercent >= requiredScorePercent ? 'completed' : 'in_progress',
                progress: scorePercent >= requiredScorePercent ? 100 : Math.max(scorePercent, 5),
                score: scorePercent,
                started_at: quizStartedAtRef.current ? new Date(quizStartedAtRef.current).toISOString() : undefined,
                completed_at: scorePercent >= requiredScorePercent ? new Date(finishedAt).toISOString() : null,
                last_opened_at: new Date(finishedAt).toISOString()
            });

            await completeLearningSession({
                sessionId: sessionIdRef.current,
                status: 'completed',
                endedAt: new Date(finishedAt).toISOString(),
                totalDurationMs,
                activeDurationMs: totalDurationMs,
                context: {
                    entry_point: 'quiz',
                    quiz_title: attemptPayload.quiz_title,
                    score_percent: scorePercent,
                    total_questions: totalQuestions,
                    timed_out_count: timedOutCount
                }
            });
            sessionIdRef.current = null;

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('lesson-progress-updated', {
                    detail: {
                        lessonId: lessonKey,
                        score: scorePercent,
                        passed: scorePercent >= requiredScorePercent
                    }
                }));
            }
        } catch (error) {
            console.error('Error guardando intento de quiz:', error);
        }
    }, [courseId, lessonId, lessonKey, lessonQuestions.length, lessonTitle, moduleId, quizConfig.title, quizTimeLimit, requiredScorePercent, user]);

    const proceedToNextQuizStep = useCallback((responsesSnapshot, scoreSnapshot) => {
        setTimeout(() => {
            if (currentQ < lessonQuestions.length - 1) {
                setCurrentQ((prev) => prev + 1);
                setTimeLeft(quizTimeLimit);
                setSelectedAnswer(null);
                setIsAnswerRevealed(false);
                questionStartedAtRef.current = Date.now();
            } else {
                void persistQuizAttempt(responsesSnapshot, scoreSnapshot);
                setIsAnswerRevealed(false);
                setQuizMode('result');
            }
        }, 800);
    }, [currentQ, lessonQuestions.length, persistQuizAttempt, quizTimeLimit]);

    const handleQuizAnswer = useCallback((optionIndex) => {
        if (selectedAnswer !== null) return;

        const currentQuestion = lessonQuestions[currentQ];
        if (!currentQuestion) return;

        const now = Date.now();
        const durationMs = questionStartedAtRef.current ? now - questionStartedAtRef.current : 0;
        const isCorrect = optionIndex !== -1 && optionIndex === currentQuestion.correct;
        const nextScore = quizScore + (isCorrect ? 1 : 0);

        setSelectedAnswer(optionIndex);
        setIsAnswerRevealed(true);

        // Asegurar que el array tenga la longitud correcta hasta la pregunta actual
        const nextResponses = [...userAnswers];
        // Asegurar que el array tenga elementos hasta currentQ
        while (nextResponses.length <= currentQ) {
            nextResponses.push(null);
        }

        const responseRecord = {
            question_index: currentQ,
            question_id: currentQuestion.id || `${lessonKey}-q${currentQ + 1}`,
            prompt: currentQuestion.q,
            selected_option_index: optionIndex,
            selected_option_label: optionIndex >= 0 ? currentQuestion.options?.[optionIndex] ?? null : null,
            correct_option_index: currentQuestion.correct,
            correct_option_label: currentQuestion.options?.[currentQuestion.correct] ?? null,
            isCorrect: isCorrect,
            timedOut: optionIndex === -1,
            durationMs: durationMs,
            started_at: questionStartedAtRef.current ? new Date(questionStartedAtRef.current).toISOString() : null,
            answered_at: new Date(now).toISOString(),
            remainingSeconds: timeLeft,
            objective: currentQuestion.objective ?? null,
            concept: currentQuestion.concept ?? null,
            difficulty: currentQuestion.difficulty ?? null
        };

        nextResponses[currentQ] = responseRecord;
        setUserAnswers(nextResponses);
        setQuizScore(nextScore);

        proceedToNextQuizStep(nextResponses, nextScore);
    }, [currentQ, lessonKey, lessonQuestions, proceedToNextQuizStep, userAnswers, quizScore, selectedAnswer, timeLeft]);

    useEffect(() => {
        handleQuizAnswerRef.current = handleQuizAnswer;
    }, [handleQuizAnswer]);

    useEffect(() => {
        if (quizMode !== 'question' || selectedAnswer !== null || timeLeft <= 0) {
            return undefined;
        }

        timerRef.current = setTimeout(() => {
            if (timeLeft <= 1) {
                handleQuizAnswerRef.current(-1);
            } else {
                setTimeLeft((prev) => prev - 1);
            }
        }, 1000);

        return () => clearTimeout(timerRef.current);
    }, [quizMode, selectedAnswer, timeLeft]);

    const startQuiz = useCallback(() => {
        const start = async () => {
            quizStartedAtRef.current = Date.now();
            questionStartedAtRef.current = Date.now();
            quizPersistedRef.current = false;
            sessionIdRef.current = null;

            if (user?.id && lessonKey) {
                try {
                    const session = await createLearningSession({
                        userId: user.id,
                        lessonId: lessonKey,
                        courseId,
                        moduleId,
                        context: {
                            entry_point: 'quiz',
                            lesson_route_id: lessonId,
                            quiz_title: quizConfig.title || lessonTitle || 'Quiz'
                        }
                    });

                    sessionIdRef.current = session?.id ?? null;
                } catch (error) {
                    console.error('Error creando sesion de aprendizaje:', error);
                }
            }

            setQuizMode('question');
            setCurrentQ(0);
            setQuizScore(0);
            setTimeLeft(quizTimeLimit);
            setSelectedAnswer(null);
            setUserAnswers([]);
        };

        void start();
    }, [courseId, lessonId, lessonKey, lessonTitle, moduleId, quizConfig.title, quizTimeLimit, user]);

    const resetQuiz = useCallback(() => {
        const reset = async () => {
            if (sessionIdRef.current && !quizPersistedRef.current) {
                try {
                    const endedAt = new Date().toISOString();
                    const totalDurationMs = quizStartedAtRef.current ? Date.now() - quizStartedAtRef.current : null;

                    await completeLearningSession({
                        sessionId: sessionIdRef.current,
                        status: 'abandoned',
                        endedAt,
                        totalDurationMs,
                        activeDurationMs: totalDurationMs,
                        context: {
                            entry_point: 'quiz',
                            abandon_reason: 'quiz_reset'
                        }
                    });
                } catch (error) {
                    console.error('Error cerrando sesion abandonada:', error);
                }
            }

            setQuizMode('intro');
            setCurrentQ(0);
            setQuizScore(0);
            setSelectedAnswer(null);
            setUserAnswers([]);
            setTimeLeft(quizTimeLimit);
            quizPersistedRef.current = false;
            sessionIdRef.current = null;
        };

        void reset();
    }, [quizTimeLimit]);

    return {
        currentQuestion: lessonQuestions[currentQ],
        currentQ,
        handleQuizAnswer,
        questionTimeFill,
        questionTimeSegments,
        quizMode,
        quizQuestions: lessonQuestions,
        quizScore,
        quizTimeLimit,
        requiredScorePercent,
        resetQuiz,
        resultPercent,
        selectedAnswer,
        setQuizMode,
        startQuiz,
        timeLeft,
        userAnswers,
        isAnswerRevealed
    };
};
