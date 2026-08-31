import { api } from './api';

export const ensureStudentProfile = async () => null;

export const fetchLessonProgress = async (userId, lessonId) => {
    if (!userId || !lessonId) return null;
    const { data, error } = await api('/lesson-progress?lesson_id=' + encodeURIComponent(lessonId));
    if (error) return null;
    return data ?? null;
};

export const upsertLessonProgress = async (payload) => {
    if (!payload?.user_id || !payload?.lesson_id) return null;
    const { data, error } = await api('/lesson-progress', {
        method: 'POST',
        body: payload
    });
    if (error) return null;
    return data ?? null;
};

export const saveQuizAttempt = async (payload) => {
    if (!payload?.lesson_id && !payload?.evaluation_key) return null;
    const evalKey = payload.evaluation_key || payload.lesson_id;
    const reqScore = payload.answers?.required_score_percent ?? 80;
    const { data, error } = await api('/attempts', {
        method: 'POST',
        body: {
            evaluation_key: evalKey,
            score: payload.score,
            passed: payload.score >= reqScore,
            completed_at: payload.finished_at || new Date().toISOString(),
            answers: payload.answers,
            points_obtained: payload.score
        }
    });
    if (error) return null;
    return data ?? null;
};

export const fetchMissionProgress = async () => [];

export const upsertMissionProgress = async () => null;