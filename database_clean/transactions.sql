-- ============================================================
-- LMS Transaction Examples
-- Demonstrating ACID properties
-- ============================================================

USE lms_db;

-- Enrollment Transaction
START TRANSACTION;

INSERT INTO enrollments (student_id, course_id)
VALUES (1, 2);

UPDATE courses
SET updated_at = NOW()
WHERE id = 2;

COMMIT;

-- Rollback Example
START TRANSACTION;

INSERT INTO enrollments (student_id, course_id)
VALUES (1, 2);

ROLLBACK;