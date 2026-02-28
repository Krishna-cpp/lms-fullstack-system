import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { Course, User } from '../../shared/models';

@Component({
    selector: 'app-instructor-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a routerLink="/instructor" class="active">Dashboard</a></li>
        <li><a routerLink="/courses">Browse</a></li>
        <li><button class="btn btn-ghost" (click)="logout()">Sign Out</button></li>
      </ul>
    </nav>

    <div class="container page-enter" style="padding-top:40px; padding-bottom:60px;">
      <!-- Header -->
      <div class="instr-header">
        <div>
          <p class="greeting-sub">Instructor Dashboard</p>
          <h1 class="greeting-name">{{ user?.name }}</h1>
          <p style="color:var(--color-text-muted)">Manage your courses and track student progress</p>
        </div>
        <div class="header-actions">
          <a routerLink="/instructor/courses/new" class="btn btn-primary">+ New Course</a>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">{{ courses.length }}</div>
          <div class="stat-label">My Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalEnrollments }}</div>
          <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ publishedCount }}</div>
          <div class="stat-label">Published</div>
        </div>
      </div>

      <!-- My Courses -->
      <div class="section-divider">
        <span>My Courses</span>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div class="empty-state" *ngIf="!loading && courses.length === 0">
        <p>You haven't created any courses yet.</p>
        <a routerLink="/instructor/courses/new" class="btn btn-primary">Create Your First Course</a>
      </div>

      <div class="courses-table" *ngIf="!loading && courses.length > 0">
        <div class="table-header">
          <span>Course</span>
          <span>Level</span>
          <span>Students</span>
          <span>Duration</span>
          <span>Actions</span>
        </div>
        <div class="table-row" *ngFor="let c of courses">
          <div class="course-info">
            <div class="course-thumb">{{ c.title.charAt(0) }}</div>
            <div>
              <div class="course-name">{{ c.title }}</div>
              <div class="course-cat">{{ c.category_name }}</div>
            </div>
          </div>
          <span class="badge" [class]="'badge-' + c.level">{{ c.level }}</span>
          <span class="enrollment-count">{{ enrollmentCounts[c.id] ? enrollmentCounts[c.id] : '—' }}</span>
          <span class="course-dur">{{ c.duration_hours }}h</span>
          <div class="row-actions">
            <a [routerLink]="['/courses', c.id]" class="btn btn-ghost btn-sm">View</a>
            <button class="btn btn-danger btn-sm" (click)="deleteCourse(c)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-divider">
        <span>Quick Actions</span>
      </div>
      <div class="quick-actions">
        <a routerLink="/instructor/courses/new" class="quick-card">
          <span class="quick-icon">📚</span>
          <h4>Create Course</h4>
          <p>Start a new course with lessons and quizzes</p>
        </a>
        <a routerLink="/courses" class="quick-card">
          <span class="quick-icon">🔍</span>
          <h4>Browse All Courses</h4>
          <p>See what other instructors are teaching</p>
        </a>
      </div>
    </div>
  `,
    styles: [`
    .instr-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .greeting-sub { color: var(--color-text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
    .greeting-name { font-family: var(--font-heading); font-size: 2.8rem; color: var(--color-ivory); margin: 4px 0 8px; }
    .header-actions { display: flex; gap: 12px; align-items: center; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 16px; }
    .stat-card { background: var(--color-card-dark); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 28px 24px; text-align: center; transition: var(--transition); }
    .stat-card:hover { border-color: rgba(212,130,10,0.4); }
    .stat-number { font-family: var(--font-heading); font-size: 2.8rem; font-weight: 900; color: var(--color-accent); }
    .stat-label { color: var(--color-text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }

    .courses-table { background: var(--color-card-dark); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
    .table-header {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      padding: 14px 20px; background: rgba(255,255,255,0.03);
      border-bottom: 1px solid var(--color-border);
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted);
    }
    .table-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      padding: 16px 20px; align-items: center;
      border-bottom: 1px solid var(--color-border); transition: var(--transition);
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: rgba(255,255,255,0.02); }
    .course-info { display: flex; align-items: center; gap: 12px; }
    .course-thumb {
      width: 40px; height: 40px; border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--color-surface), var(--color-bg-alt));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-size: 1.2rem; color: var(--color-accent); flex-shrink: 0;
    }
    .course-name { color: var(--color-ivory); font-size: 0.9rem; font-weight: 500; }
    .course-cat { color: var(--color-text-muted); font-size: 0.75rem; }
    .enrollment-count { font-family: var(--font-heading); color: var(--color-ivory); font-size: 1.1rem; }
    .course-dur { color: var(--color-text-muted); font-size: 0.85rem; }
    .row-actions { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 14px; font-size: 0.8rem; }

    .empty-state { text-align: center; padding: 60px; color: var(--color-text-muted); }
    .empty-state p { margin-bottom: 20px; }

    .quick-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .quick-card {
      background: var(--color-card-dark); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); padding: 28px 24px;
      text-decoration: none; transition: var(--transition); display: block;
    }
    .quick-card:hover { border-color: var(--color-accent); transform: translateY(-2px); }
    .quick-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
    .quick-card h4 { color: var(--color-ivory); margin-bottom: 6px; }
    .quick-card p { color: var(--color-text-muted); font-size: 0.85rem; margin: 0; }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
      .table-header, .table-row { grid-template-columns: 1fr 1fr; }
      .table-header span:nth-child(n+3), .table-row > *:nth-child(n+3) { display: none; }
    }
  `],
})
export class InstructorDashboardComponent implements OnInit {
    user: User | null = null;
    courses: Course[] = [];
    enrollmentCounts: Record<number, number> = {};
    totalEnrollments = 0;
    publishedCount = 0;
    loading = true;

    constructor(
        private auth: AuthService,
        private courseSvc: CourseService,
        private enrollSvc: EnrollmentService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.user = this.auth.currentUser();
        this.loadCourses();
    }

    loadCourses(): void {
        this.courseSvc.getAll().subscribe(courses => {
            // Filter to only instructor's courses
            this.courses = courses.filter(c => c.instructor_id === this.user?.id);
            this.publishedCount = this.courses.filter(c => c.is_published).length;

            // Load enrollment counts for each course
            let loaded = 0;
            if (this.courses.length === 0) { this.loading = false; return; }

            this.courses.forEach(course => {
                this.enrollSvc.getCourseEnrollments(course.id).subscribe({
                    next: (enrollments) => {
                        this.enrollmentCounts[course.id] = enrollments.length;
                        this.totalEnrollments = Object.values(this.enrollmentCounts).reduce((a, b) => a + b, 0);
                        loaded++;
                        if (loaded === this.courses.length) this.loading = false;
                    },
                    error: () => {
                        this.enrollmentCounts[course.id] = 0;
                        loaded++;
                        if (loaded === this.courses.length) this.loading = false;
                    },
                });
            });
        });
    }

    deleteCourse(course: Course): void {
        if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
        this.courseSvc.delete(course.id).subscribe({
            next: () => { this.courses = this.courses.filter(c => c.id !== course.id); },
            error: (err) => alert(err.error?.error ?? 'Delete failed.'),
        });
    }

    logout(): void { this.auth.logout(); }
}
