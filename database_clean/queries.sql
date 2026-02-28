-- ============================================================
-- LMS Index Optimization
-- Designed for read-heavy workload
-- ============================================================

USE lms_db;

-- Enrollment lookups
CREATE INDEX idx_enroll_course ON enrollments(course_id);
CREATE INDEX idx_enroll_student ON enrollments(student_id);

-- Composite index for course-student filtering
CREATE INDEX idx_course_student ON enrollments(course_id, student_id);

-- Lesson retrieval per course
CREATE INDEX idx_lessons_course ON lessons(course_id);

-- Login analytics
CREATE INDEX idx_login_user_time ON login_history(user_id, login_at);

-- Published course filtering
CREATE INDEX idx_courses_published ON courses(is_published);