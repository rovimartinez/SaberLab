# Learning Analytics Notes

## Keep vs change

Keep these tables as the operational layer:

- `student_profiles`
- `student_lesson_progress`
- `student_quiz_attempts`
- `student_mission_progress`
- `student_flashcards`

Add these as the analytics layer:

- `student_learning_sessions`
- `student_content_events`
- `student_quiz_question_events`
- `student_flashcard_events`
- `student_mission_attempts`
- `student_concept_mastery`

## Why this is the right compromise

- The current tables are good for app state and fast UI reads.
- The new tables are better for process-oriented analytics.
- This avoids breaking current progress flows while preparing the project for many courses and many students.

## Frontend wiring status

- `student_learning_sessions`: connected
- `student_quiz_question_events`: connected
- `student_content_events`: connected
- `student_flashcard_events`: connected
- `student_mission_attempts`: connected
- `student_concept_mastery`: connected from quiz concept signals

## Minimum events that must always be recorded

These are the baseline events for every lesson flow. New lessons should keep this minimum contract even if they add extra events.

### `student_learning_sessions`

Always record:

- session start
- session end
- final status: `completed`, `abandoned`, or `timeout`
- lesson id
- module id when available
- entry point in `context`

### `student_quiz_question_events`

Always record:

- `question_id`
- `question_index`
- `concept`
- `objective`
- `difficulty`
- selected answer
- correct answer
- `is_correct`
- `timed_out`
- `duration_ms`
- `started_at`
- `answered_at`

### `student_content_events`

Always record:

- `content_view`
- `tab_change`
- `focus`
- `blur`

Recommended when available:

- `challenge_view`
- `challenge_simulate`
- `section_view`
- `scroll_depth`

### `student_flashcard_events`

Always record:

- `flip`
- `mark_known`
- `mark_unknown`

Recommended:

- `summary_open`
- `summary_close`

### `student_mission_attempts`

Always record:

- mission start
- mission submit or verify
- mission completion or abandonment
- `attempt_number`
- `status`
- `score`
- `duration_ms`
- `compile_errors`
- `hint_used`

## Aggregate metrics to standardize

### By concept

- attempts
- correct answers
- accuracy percent
- average response time
- timed out count
- confidence score
- mastery level

### By lesson

- sessions started
- sessions completed
- abandonment rate
- average lesson duration
- quiz accuracy
- flashcard known vs unknown ratio
- mission completion rate

### By module

- active students
- lessons completed
- average score
- average session duration
- hardest concepts by accuracy

### By course

- active students
- total sessions
- completion rate
- average mastery distribution
- top friction lessons
- top difficult concepts

## Dashboard questions this model should answer

- Which concepts are hardest for students right now?
- Which lessons have the highest abandonment?
- Which quiz questions take too long even when students answer correctly?
- Which missions require too many retries?
- Which flashcards remain mostly `unknown` after repeated exposure?
- Which modules have strong progress but weak mastery retention?

## Suggested next SQL layer

- Run [`supabase-analytics-views.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-analytics-views.sql) after the base analytics schema.
- Use [`analytics-dashboard-queries.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/analytics-dashboard-queries.sql) as the first dashboard/query pack.
