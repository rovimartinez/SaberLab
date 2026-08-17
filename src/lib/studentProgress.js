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

export const saveQuizAttempt = async () => null;

export const fetchMissionProgress = async () => [];

export const upsertMissionProgress = async () => null;