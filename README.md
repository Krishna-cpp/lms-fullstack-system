# Learning Management System (LMS)

A full-stack Learning Management System built using **Angular, Node.js, Express, and MySQL (InnoDB)**.

This system models real-world academic workflows including course publishing, student enrollment, quizzes, assignments, certificate issuance, and progress tracking.

---

## 🏗 System Architecture

**Frontend:** Angular (Standalone Components)  
**Backend:** Node.js + Express (REST API)  
**Database:** MySQL (InnoDB engine, normalized relational schema)

The system enforces strict referential integrity using foreign keys and `ON DELETE CASCADE` policies.

---

## 📊 Database Design

The database is normalized to **Third Normal Form (3NF)**.

### Core Entities

- Users (students, instructors, admins)
- Categories
- Courses
- Lessons
- Enrollments (many-to-many bridge)
- Assignments
- Submissions
- Quizzes
- Quiz Questions
- Certificates
- Login History

### Design Features

- Composite `UNIQUE` constraints for:
  - `enrollments (student_id, course_id)`
  - `submissions (assignment_id, student_id)`
  - `certificates (student_id, course_id)`
- Foreign key constraints with cascading deletes
- Indexing strategy for JOIN-heavy queries
- `ENUM` usage for role and course level
- Audit tracking (`created_at`, `updated_at`)
- Transaction-safe enrollment workflow

---

## ⚡ Performance Awareness

- Indexes created on foreign key columns
- Composite indexes added for JOIN optimization
- Query plan analyzed using `EXPLAIN`
- InnoDB used for row-level locking and transactional integrity

---

## 🔄 Example Analytical Query

```sql
SELECT u.name, c.title, e.progress
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE e.completed = 1;
```

---

### 🚀 Running Locally
1️⃣ Import Database Schema

Run:

```sql
database_clean/schema.sql
database_clean/indexes.sql
```

2️⃣ Start Backend
```bash

cd backend
npm install
npm run dev
```
3️⃣ Start Frontend
```bash
cd frontend
npm install
ng serve
```
👨‍💻 Author

Krishna Kumar
Computer Science Engineering

---

Now run:

```bash
git add README.md
git commit -m "Fix README formatting and improve documentation"
git push
