# Learning Management System (LMS)

A full-stack Learning Management System built using Angular, Node.js, and MySQL.

---

## Tech Stack

- Frontend: Angular
- Backend: Node.js + Express
- Database: MySQL (InnoDB)

---

## Database Design

The database follows Third Normal Form (3NF) and enforces referential integrity.

### Core Tables

- users
- courses
- categories
- lessons
- enrollments
- quizzes
- quiz_questions
- assignments
- submissions
- certificates
- login_history

### Key Features

- Foreign key constraints with ON DELETE CASCADE
- Composite UNIQUE constraints for many-to-many relationships
- Index optimization for read-heavy workload
- Transaction-safe enrollment workflow
- Analytical JOIN queries

---

## How To Run

1. Import database schema:
   Run `schema.sql`
   Then run `indexes.sql`

2. Start backend:
   cd backend
   npm install
   npm run dev

3. Start frontend:
   cd frontend
   npm install
   ng serve

---

## Author

Krishna Kumar