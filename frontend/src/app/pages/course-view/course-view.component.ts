import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { CertificateService } from '../../core/services/certificate.service';
import { AuthService } from '../../core/services/auth.service';
import { Course, Lesson, User } from '../../shared/models';

@Component({
  selector: 'app-course-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a [routerLink]="user?.role === 'instructor' ? '/instructor' : '/dashboard'">Dashboard</a></li>
        <li><a routerLink="/courses">Courses</a></li>
        <li><button class="btn btn-ghost" (click)="logout()">Sign Out</button></li>
      </ul>
    </nav>

    <div class="spinner" *ngIf="loading"></div>

    <div *ngIf="!loading && course" class="course-view-layout page-enter">
      <!-- Lesson Sidebar -->
      <aside class="lesson-sidebar">
        <div class="sidebar-header">
          <span class="badge" [class]="'badge-' + course.level">{{ course.level }}</span>
          <h2 class="sidebar-title">{{ course.title }}</h2>
          <p class="sidebar-instructor">by {{ course.instructor_name }}</p>
        </div>

        <div class="lesson-list">
          <div class="lesson-item"
            *ngFor="let lesson of course.lessons; let i = index"
            [class.active]="selectedLesson?.id === lesson.id"
            (click)="selectLesson(lesson)">
            <div class="lesson-number">{{ i + 1 }}</div>
            <div class="lesson-info">
              <span class="lesson-title">{{ lesson.title }}</span>
              <span class="lesson-duration">{{ lesson.duration_min }} min</span>
            </div>
            <span class="lesson-check">✓</span>
          </div>
        </div>

        <div class="sidebar-footer" *ngIf="user?.role === 'student'">
          <button class="btn btn-primary" style="width:100%;" (click)="completeCourse()" [disabled]="completing">
            {{ completing ? 'Issuing...' : '🎓 Complete & Earn Certificate' }}
          </button>
          <div class="alert alert-success" *ngIf="certSuccess" style="margin-top:12px;">
            Certificate issued! <a routerLink="/certificates">View →</a>
          </div>
          <div class="alert alert-error" *ngIf="certError" style="margin-top:12px;">{{ certError }}</div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="lesson-content">
        <!-- Course Header (when no lesson selected) -->
        <div class="course-header" *ngIf="!selectedLesson">
          <div class="course-meta">
            <span class="badge badge-amber">{{ course.category_name }}</span>
            <span class="course-duration-badge">{{ course.duration_hours }}h total</span>
          </div>
          <h1 class="course-main-title">{{ course.title }}</h1>
          <p class="course-description">{{ course.description }}</p>

          <div class="course-info-grid">
            <div class="info-item">
              <span class="info-label">Instructor</span>
              <span class="info-value">{{ course.instructor_name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Level</span>
              <span class="info-value">{{ course.level | titlecase }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Lessons</span>
              <span class="info-value">{{ course.lessons?.length ?? 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Duration</span>
              <span class="info-value">{{ course.duration_hours }} hours</span>
            </div>
          </div>

          <div class="enroll-section" *ngIf="user?.role === 'student' && !enrolled">
            <button class="btn btn-primary" style="font-size:1.1rem; padding:16px 40px;" (click)="enroll()" [disabled]="enrolling">
              {{ enrolling ? 'Enrolling...' : 'Enroll in This Course' }}
            </button>
            <div class="alert alert-error" *ngIf="enrollError" style="margin-top:12px;">{{ enrollError }}</div>
          </div>
          <div class="alert alert-success" *ngIf="enrolled" style="margin-top:16px;">
            ✓ You are enrolled. Select a lesson from the sidebar to begin.
          </div>

          <p class="start-hint" *ngIf="course.lessons && course.lessons.length > 0">
            ← Select a lesson from the sidebar to begin
          </p>
        </div>

        <!-- Lesson Content -->
        <div class="lesson-view" *ngIf="selectedLesson">
          <div class="lesson-header">
            <h2 class="lesson-view-title">{{ selectedLesson.title }}</h2>
            <span class="lesson-view-duration">{{ selectedLesson.duration_min }} min read</span>
          </div>

          <div class="lesson-body">
            <p *ngIf="selectedLesson.content">{{ selectedLesson.content }}</p>
            <p *ngIf="!selectedLesson.content" style="color:var(--color-text-muted); font-style:italic;">
              No content available for this lesson yet.
            </p>
          </div>

          <!-- Quiz & Assignment CTAs -->
          <div class="lesson-actions" *ngIf="user?.role === 'student'">
            <a [routerLink]="['/quiz', selectedLesson.id]" class="action-card">
              <span class="action-icon">📝</span>
              <div>
                <h4>Take Quiz</h4>
                <p>Test your understanding of this lesson</p>
              </div>
              <span class="action-arrow">→</span>
            </a>
            <a [routerLink]="['/assignments', selectedLesson.id]" class="action-card">
              <span class="action-icon">📎</span>
              <div>
                <h4>Submit Assignment</h4>
                <p>Upload your work for this lesson</p>
              </div>
              <span class="action-arrow">→</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .course-view-layout { display: grid; grid-template-columns: 300px 1fr; min-height: calc(100vh - 64px); }
    .lesson-sidebar {
      background: var(--color-bg-alt); border-right: 1px solid var(--color-border);
      display: flex; flex-direction: column; overflow-y: auto;
      position: sticky; top: 64px; height: calc(100vh - 64px);
    }
    .sidebar-header { padding: 24px; border-bottom: 1px solid var(--color-border); }
    .sidebar-title { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-ivory); margin: 10px 0 6px; line-height: 1.3; }
    .sidebar-instructor { color: var(--color-text-muted); font-size: 0.8rem; }
    .lesson-list { flex: 1; overflow-y: auto; padding: 12px 0; }
    .lesson-item {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px; cursor: pointer; transition: var(--transition);
      border-left: 3px solid transparent;
    }
    .lesson-item:hover { background: rgba(255,255,255,0.04); }
    .lesson-item.active { background: rgba(212,130,10,0.08); border-left-color: var(--color-accent); }
    .lesson-number {
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(255,255,255,0.08); border: 1px solid var(--color-border);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; color: var(--color-text-muted); flex-shrink: 0;
    }
    .lesson-item.active .lesson-number { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
    .lesson-info { flex: 1; min-width: 0; }
    .lesson-title { display: block; font-size: 0.85rem; color: var(--color-ivory-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lesson-item.active .lesson-title { color: var(--color-ivory); }
    .lesson-duration { font-size: 0.75rem; color: var(--color-text-muted); }
    .lesson-check { color: var(--color-sage); font-size: 0.85rem; opacity: 0; }
    .lesson-item.active .lesson-check { opacity: 1; }
    .sidebar-footer { padding: 20px; border-top: 1px solid var(--color-border); }

    .lesson-content { padding: 40px; overflow-y: auto; }
    .course-header { max-width: 720px; }
    .course-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .course-duration-badge { color: var(--color-text-muted); font-size: 0.85rem; }
    .course-main-title { font-family: var(--font-heading); font-size: 2.8rem; color: var(--color-ivory); margin-bottom: 16px; }
    .course-description { color: var(--color-ivory-dim); font-size: 1.05rem; line-height: 1.7; margin-bottom: 32px; }
    .course-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
    .info-item { background: var(--color-card-dark); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 16px; }
    .info-label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 6px; }
    .info-value { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-ivory); }
    .start-hint { color: var(--color-text-muted); font-style: italic; margin-top: 24px; }

    .lesson-view { max-width: 720px; }
    .lesson-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border); }
    .lesson-view-title { font-family: var(--font-heading); font-size: 2rem; color: var(--color-ivory); }
    .lesson-view-duration { color: var(--color-text-muted); font-size: 0.85rem; white-space: nowrap; margin-top: 8px; }
    .lesson-body { color: var(--color-ivory-dim); line-height: 1.8; font-size: 1.05rem; margin-bottom: 40px; }

    .lesson-actions { display: flex; flex-direction: column; gap: 16px; }
    .action-card {
      display: flex; align-items: center; gap: 16px;
      background: var(--color-card-dark); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); padding: 20px 24px;
      text-decoration: none; transition: var(--transition);
    }
    .action-card:hover { border-color: var(--color-accent); transform: translateX(4px); }
    .action-icon { font-size: 1.8rem; }
    .action-card h4 { color: var(--color-ivory); margin-bottom: 4px; }
    .action-card p { color: var(--color-text-muted); font-size: 0.85rem; margin: 0; }
    .action-arrow { margin-left: auto; color: var(--color-accent); font-size: 1.2rem; }

    @media (max-width: 900px) {
      .course-view-layout { grid-template-columns: 1fr; }
      .lesson-sidebar { position: relative; height: auto; top: 0; }
      .course-info-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class CourseViewComponent implements OnInit {
  course: Course | null = null;
  selectedLesson: Lesson | null = null;
  loading = true;
  enrolled = false;
  enrolling = false;
  enrollError = '';
  completing = false;
  certSuccess = false;
  certError = '';
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private courseSvc: CourseService,
    private enrollSvc: EnrollmentService,
    private certSvc: CertificateService,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.user = this.auth.currentUser();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseSvc.getById(id).subscribe({
      next: (c) => { this.course = c; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/courses']); },
    });

    if (this.user?.role === 'student') {
      this.enrollSvc.getMyEnrollments().subscribe(enrollments => {
        this.enrolled = enrollments.some(e => e.course_id === id);
      });
    }
  }

  selectLesson(lesson: Lesson): void {
    this.selectedLesson = lesson;
  }

  enroll(): void {
    if (!this.course) return;
    this.enrolling = true;
    this.enrollSvc.enroll(this.course.id).subscribe({
      next: () => { this.enrolled = true; this.enrolling = false; },
      error: (err) => { this.enrollError = err.error?.error ?? 'Enrollment failed.'; this.enrolling = false; },
    });
  }

  completeCourse(): void {
    if (!this.course) return;
    this.completing = true;
    this.certError = '';
    this.certSvc.issue(this.course.id, 90).subscribe({
      next: () => { this.certSuccess = true; this.completing = false; },
      error: (err: any) => { this.certError = err.error?.error ?? 'Could not issue certificate.'; this.completing = false; },
    });
  }

  logout(): void { this.auth.logout(); }
}
