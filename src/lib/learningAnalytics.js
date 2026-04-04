import { supabase } from './supabase';

const nowIso = () => new Date().toISOString();

const getDeviceInfo = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {};
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
};

export const createLearningSession = async ({
  userId,
  lessonId,
  courseId,
  moduleId,
  source = 'web',
  context = {}
}) => {
  if (!userId || !lessonId) return null;

  const payload = {
    user_id: userId,
    lesson_id: lessonId,
    course_id: courseId ?? null,
    module_id: moduleId ?? null,
    source,
    session_status: 'active',
    started_at: nowIso(),
    last_activity_at: nowIso(),
    entry_path: typeof window !== 'undefined' ? window.location.pathname : null,
    device_info: getDeviceInfo(),
    context
  };

  const { data, error } = await supabase
    .from('student_learning_sessions')
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const completeLearningSession = async ({
  sessionId,
  status = 'completed',
  endedAt,
  totalDurationMs,
  activeDurationMs,
  idleDurationMs,
  maxScrollDepth,
  context
}) => {
  if (!sessionId) return null;

  const payload = {
    session_status: status,
    ended_at: endedAt || nowIso(),
    last_activity_at: endedAt || nowIso(),
    total_duration_ms: totalDurationMs ?? null,
    active_duration_ms: activeDurationMs ?? totalDurationMs ?? null,
    idle_duration_ms: idleDurationMs ?? null,
    max_scroll_depth: maxScrollDepth ?? null,
    exit_path: typeof window !== 'undefined' ? window.location.pathname : null
  };

  if (context) {
    payload.context = context;
  }

  const { data, error } = await supabase
    .from('student_learning_sessions')
    .update(payload)
    .eq('id', sessionId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const saveQuizQuestionEvents = async ({
  attemptId,
  sessionId,
  userId,
  lessonId,
  responses = []
}) => {
  if (!attemptId || !userId || !lessonId || !Array.isArray(responses) || responses.length === 0) {
    return [];
  }

  const rows = responses.map((response) => ({
    attempt_id: attemptId,
    session_id: sessionId ?? null,
    user_id: userId,
    lesson_id: lessonId,
    question_id: response.question_id,
    question_index: response.question_index,
    concept: response.concept ?? null,
    objective: response.objective ?? null,
    difficulty: response.difficulty ?? null,
    selected_option_index: response.selected_option_index,
    selected_option_label: response.selected_option_label ?? null,
    correct_option_index: response.correct_option_index,
    correct_option_label: response.correct_option_label ?? null,
    is_correct: Boolean(response.is_correct),
    timed_out: Boolean(response.timed_out),
    duration_ms: response.duration_ms ?? null,
    remaining_seconds: response.remaining_seconds ?? null,
    started_at: response.started_at ?? null,
    answered_at: response.answered_at ?? null,
    payload: {
      prompt: response.prompt ?? null
    }
  }));

  const { data, error } = await supabase
    .from('student_quiz_question_events')
    .insert(rows)
    .select();

  if (error) throw error;
  return data ?? [];
};

export const saveFlashcardEvent = async ({
  sessionId,
  userId,
  lessonId,
  cardId,
  sectionId,
  eventType,
  responseTimeMs,
  confidence,
  payload = {}
}) => {
  if (!userId || !lessonId || !cardId || !eventType) return null;

  const { data, error } = await supabase
    .from('student_flashcard_events')
    .insert({
      session_id: sessionId ?? null,
      user_id: userId,
      lesson_id: lessonId,
      card_id: cardId,
      section_id: sectionId ?? null,
      event_type: eventType,
      response_time_ms: responseTimeMs ?? null,
      confidence: confidence ?? null,
      payload
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const saveContentEvent = async ({
  sessionId,
  userId,
  lessonId,
  blockId,
  sectionId,
  eventType,
  dwellTimeMs,
  progressPercent,
  eventValue,
  payload = {}
}) => {
  if (!userId || !lessonId || !eventType) return null;

  const { data, error } = await supabase
    .from('student_content_events')
    .insert({
      session_id: sessionId ?? null,
      user_id: userId,
      lesson_id: lessonId,
      block_id: blockId ?? null,
      section_id: sectionId ?? null,
      event_type: eventType,
      dwell_time_ms: dwellTimeMs ?? null,
      progress_percent: progressPercent ?? null,
      event_value: eventValue ?? null,
      payload
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createMissionAttempt = async ({
  sessionId,
  userId,
  lessonId,
  missionId,
  missionTitle,
  attemptNumber,
  codeSnapshot,
  hintUsed = false,
  feedback = {}
}) => {
  if (!userId || !lessonId || missionId == null) return null;

  const { data, error } = await supabase
    .from('student_mission_attempts')
    .insert({
      session_id: sessionId ?? null,
      user_id: userId,
      lesson_id: lessonId,
      mission_id: missionId,
      mission_title: missionTitle ?? null,
      attempt_number: attemptNumber ?? null,
      status: 'started',
      hint_used: hintUsed,
      code_snapshot: codeSnapshot ?? null,
      feedback,
      started_at: nowIso()
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateMissionAttempt = async ({
  attemptId,
  status,
  score,
  durationMs,
  compileErrors,
  hintUsed,
  codeSnapshot,
  feedback,
  completedAt
}) => {
  if (!attemptId) return null;

  const payload = {};
  if (status != null) payload.status = status;
  if (score != null) payload.score = score;
  if (durationMs != null) payload.duration_ms = durationMs;
  if (compileErrors != null) payload.compile_errors = compileErrors;
  if (hintUsed != null) payload.hint_used = hintUsed;
  if (codeSnapshot != null) payload.code_snapshot = codeSnapshot;
  if (feedback != null) payload.feedback = feedback;
  if (completedAt != null) payload.completed_at = completedAt;

  const { data, error } = await supabase
    .from('student_mission_attempts')
    .update(payload)
    .eq('id', attemptId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getMasteryLevel = ({ attemptsCount, accuracy, avgResponseTimeMs }) => {
  if (attemptsCount >= 8 && accuracy >= 90 && avgResponseTimeMs != null && avgResponseTimeMs <= 12000) {
    return 'automatic';
  }

  if (attemptsCount >= 5 && accuracy >= 80) {
    return 'secure';
  }

  if (attemptsCount >= 3 && accuracy >= 60) {
    return 'developing';
  }

  return 'emerging';
};

export const upsertConceptMasteryFromQuizResponses = async ({
  userId,
  lessonId,
  courseId,
  responses = []
}) => {
  if (!userId || !lessonId || !Array.isArray(responses) || responses.length === 0) {
    return [];
  }

  const conceptBuckets = responses.reduce((acc, response) => {
    if (!response?.concept) return acc;

    const concept = String(response.concept).trim();
    if (!concept) return acc;

    if (!acc[concept]) {
      acc[concept] = [];
    }

    acc[concept].push(response);
    return acc;
  }, {});

  const concepts = Object.keys(conceptBuckets);
  if (!concepts.length) return [];

  const { data: existingRows, error: existingError } = await supabase
    .from('student_concept_mastery')
    .select('*')
    .eq('user_id', userId)
    .in('concept', concepts);

  if (existingError) throw existingError;

  const existingByConcept = new Map((existingRows ?? []).map((row) => [row.concept, row]));

  const rows = concepts.map((concept) => {
    const conceptResponses = conceptBuckets[concept];
    const existing = existingByConcept.get(concept);
    const previousAttempts = existing?.attempts_count ?? 0;
    const previousCorrect = existing?.correct_count ?? 0;
    const previousAvgResponseTime = existing?.avg_response_time_ms != null
      ? Number(existing.avg_response_time_ms)
      : null;
    const previousWeightedDuration = previousAvgResponseTime != null
      ? previousAvgResponseTime * previousAttempts
      : 0;

    const newAttempts = conceptResponses.length;
    const newCorrect = conceptResponses.filter((response) => response.is_correct).length;
    const newDurationValues = conceptResponses
      .map((response) => response.duration_ms)
      .filter((durationMs) => Number.isFinite(durationMs));
    const newDurationTotal = newDurationValues.reduce((sum, durationMs) => sum + durationMs, 0);
    const durationSamples = newDurationValues.length;
    const totalAttempts = previousAttempts + newAttempts;
    const totalCorrect = previousCorrect + newCorrect;
    const totalWeightedDuration = previousWeightedDuration + newDurationTotal;
    const avgResponseTimeMs = durationSamples > 0 || previousAvgResponseTime != null
      ? Number((totalWeightedDuration / Math.max(totalAttempts, 1)).toFixed(2))
      : null;
    const accuracy = totalAttempts > 0
      ? Number(((totalCorrect / totalAttempts) * 100).toFixed(2))
      : 0;
    const speedScore = avgResponseTimeMs == null
      ? null
      : clamp(100 - ((avgResponseTimeMs / 30000) * 100), 0, 100);
    const confidenceScore = speedScore == null
      ? accuracy
      : Number((((accuracy * 0.7) + (speedScore * 0.3))).toFixed(2));

    const firstSeenCandidates = conceptResponses
      .map((response) => response.started_at || response.answered_at)
      .filter(Boolean)
      .sort();
    const lastSeenCandidates = conceptResponses
      .map((response) => response.answered_at || response.started_at)
      .filter(Boolean)
      .sort();

    return {
      user_id: userId,
      concept,
      course_id: courseId ?? existing?.course_id ?? null,
      latest_lesson_id: lessonId,
      attempts_count: totalAttempts,
      correct_count: totalCorrect,
      accuracy,
      avg_response_time_ms: avgResponseTimeMs,
      confidence_score: confidenceScore,
      mastery_level: getMasteryLevel({
        attemptsCount: totalAttempts,
        accuracy,
        avgResponseTimeMs
      }),
      first_seen_at: existing?.first_seen_at ?? firstSeenCandidates[0] ?? nowIso(),
      last_seen_at: lastSeenCandidates[lastSeenCandidates.length - 1] ?? existing?.last_seen_at ?? nowIso(),
      updated_at: nowIso()
    };
  });

  const { data, error } = await supabase
    .from('student_concept_mastery')
    .upsert(rows, { onConflict: 'user_id,concept' })
    .select();

  if (error) throw error;
  return data ?? [];
};
