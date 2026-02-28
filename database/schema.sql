-- ============================================================
-- LMS Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lms_db;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(191)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
  avatar_url  VARCHAR(500)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL UNIQUE,
  description TEXT          NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255)  NOT NULL,
  description    TEXT          NULL,
  thumbnail_url  VARCHAR(500)  NULL,
  level          ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  duration_hours DECIMAL(5,2)  NOT NULL DEFAULT 0,
  category_id    INT UNSIGNED  NOT NULL,
  instructor_id  INT UNSIGNED  NOT NULL,
  is_published   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_category   FOREIGN KEY (category_id)   REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES users(id)       ON DELETE RESTRICT
);

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id    INT UNSIGNED  NOT NULL,
  title        VARCHAR(255)  NOT NULL,
  content      LONGTEXT      NULL,
  order_index  INT UNSIGNED  NOT NULL DEFAULT 0,
  duration_min INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lesson_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id   INT UNSIGNED  NOT NULL,
  course_id    INT UNSIGNED  NOT NULL,
  progress     TINYINT UNSIGNED NOT NULL DEFAULT 0,  -- 0-100 percent
  completed    TINYINT(1)    NOT NULL DEFAULT 0,
  enrolled_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME      NULL,
  UNIQUE KEY uq_enrollment (student_id, course_id),
  CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_enroll_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

-- ============================================================
-- QUIZZES
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lesson_id   INT UNSIGNED  NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quiz_id        INT UNSIGNED  NOT NULL,
  question_text  TEXT          NOT NULL,
  option_a       VARCHAR(500)  NOT NULL,
  option_b       VARCHAR(500)  NOT NULL,
  option_c       VARCHAR(500)  NOT NULL,
  option_d       VARCHAR(500)  NOT NULL,
  correct_option CHAR(1)       NOT NULL COMMENT 'a|b|c|d',
  order_index    INT UNSIGNED  NOT NULL DEFAULT 0,
  CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lesson_id    INT UNSIGNED  NOT NULL,
  title        VARCHAR(255)  NOT NULL,
  description  TEXT          NULL,
  due_date     DATETIME      NULL,
  max_score    INT UNSIGNED  NOT NULL DEFAULT 100,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignment_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assignment_id   INT UNSIGNED  NOT NULL,
  student_id      INT UNSIGNED  NOT NULL,
  file_url        VARCHAR(500)  NOT NULL,
  score           INT UNSIGNED  NULL,
  feedback        TEXT          NULL,
  submitted_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_submission (assignment_id, student_id),
  CONSTRAINT fk_sub_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_student    FOREIGN KEY (student_id)    REFERENCES users(id)        ON DELETE CASCADE
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id   INT UNSIGNED  NOT NULL,
  course_id    INT UNSIGNED  NOT NULL,
  score        INT UNSIGNED  NULL,
  issued_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_certificate (student_id, course_id),
  CONSTRAINT fk_cert_student FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_cert_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
-- ============================================================
-- INDEXES
-- ============================================================
-- Note: Indexes are created automatically for Primary and Foreign Keys.
-- Additional validation indexes can be added manually if needed.
-- (Removed complex procedure to ensure reliable startup compatibility)

-- ============================================================
-- LOGIN HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS login_history (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NOT NULL,
  ip_address   VARCHAR(45)   NOT NULL,
  login_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
