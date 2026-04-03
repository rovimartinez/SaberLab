import { supabase } from './supabase';

const nowIso = () => new Date().toISOString();

export const ensureStudentProfile = async (user) => {
  if (!user?.id) return null;

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    provider: user.app_metadata?.provider || null,
    last_login_at: nowIso(),
    updated_at: nowIso()
  };

  const { data, error } = await supabase
    .from('student_profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const fetchLessonProgress = async (userId, lessonId) => {
  if (!userId || !lessonId) return null;

  const { data, error } = await supabase
    .from('student_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
};

export const upsertLessonProgress = async (payload) => {
  if (!payload?.user_id || !payload?.lesson_id) return null;

  const { data, error } = await supabase
    .from('student_lesson_progress')
    .upsert(
      {
        ...payload,
        updated_at: nowIso(),
        last_opened_at: payload.last_opened_at || nowIso()
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const saveQuizAttempt = async (payload) => {
  if (!payload?.user_id || !payload?.lesson_id) return null;

  const { data, error } = await supabase
    .from('student_quiz_attempts')
    .insert({
      ...payload,
      created_at: nowIso()
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const fetchMissionProgress = async (userId, lessonId) => {
  if (!userId || !lessonId) return [];

  const { data, error } = await supabase
    .from('student_mission_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('mission_id', { ascending: true });

  if (error) throw error;
  return data ?? [];
};

export const upsertMissionProgress = async (payload) => {
  if (!payload?.user_id || !payload?.lesson_id || payload?.mission_id == null) return null;

  const { data, error } = await supabase
    .from('student_mission_progress')
    .upsert(
      {
        ...payload,
        updated_at: nowIso(),
        completed_at: payload.status === 'completed' ? (payload.completed_at || nowIso()) : payload.completed_at ?? null
      },
      { onConflict: 'user_id,lesson_id,mission_id' }
    )
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};
