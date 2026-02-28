import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { CertificateService } from '../../core/services/certificate.service';
import { CourseService } from '../../core/services/course.service';
import { Enrollment, Certificate, Course, User } from '../../shared/models';

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a routerLink="/dashboard" class="active">Dashboard</a></li>
        <li><a routerLink="/courses">Browse Courses</a></li>
        <li><a routerLink="/certificates">Certificates</a></li>
        <li><button class="btn btn-ghost" (click)="logout()">Sign Out</button></li>
      </ul>
    </nav>

    <div class="container page-enter" style="padding-top:40px; padding-bottom:60px;">
      <!-- Greeting -->
      <div class="greeting-section">
        <div class="greeting-text">
          <p class="greeting-sub">Good day,</p>
          <h1 class="greeting-name">{{ user?.name }}</h1>
          <p class="greeting-desc">Continue where you left off or explore something new.</p>
        </div>
        <div class="greeting-badge">
          <span class="badge badge-amber">{{ user?.role }}</span>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">{{ enrollments.length }}</div>
          <div class="stat-label">Enrolled Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ completedCount }}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ certificates.length }}</div>
          <div class="stat-label">Certificates Earned</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ avgProgress }}%</div>
          <div class="stat-label">Avg. Progress</div>
        </div>
      </div>

      <!-- Continue Learning -->
      <div class="section-divider" *ngIf="inProgress.length > 0">
        <span>Continue Learning</span>
      </div>
      <div class="grid-2" *ngIf="inProgress.length > 0">
        <div class="course-card" *ngFor="let e of inProgress">
          <div class="course-card-header">
            <span class="badge" [class]="'badge-' + (e.level ?? 'beginner')">{{ e.level }}</span>
            <span class="course-duration">{{ e.duration_hours }}h</span>
          </div>
          <h3 class="course-title">{{ e.course_title }}</h3>
          <p class="course-instructor">by {{ e.instructor_name }}</p>
          <div class="progress-bar" style="margin: 16px 0 8px;">
            <div class="progress-fill" [style.width.%]="e.progress"></div>
          </div>
          <div class="progress-label">{{ e.progress }}% complete</div>
          <a [routerLink]="['/courses', e.course_id]" class="btn btn-primary btn-sm">Continue →</a>
        </div>
      </div>

      <!-- Explore Courses -->
      <div class="section-divider">
        <span>Explore Courses</span>
      </div>

      <!-- Category Filter -->
      <div class="filter-pills">
        <button class="pill" [class.active]="!activeCategory" (click)="activeCategory = null">All</button>
        <button class="pill" *ngFor="let cat of categories" [class.active]="activeCategory === cat"
          (click)="activeCategory = cat">{{ cat }}</button>
      </div>

      <div class="grid-3" *ngIf="!loadingCourses">
        <div class="explore-card" *ngFor="let c of filteredCourses">
          <div class="explore-card-img">
            <img *ngIf="c.thumbnail_url" [src]="c.thumbnail_url" [alt]="c.title" />
            <div *ngIf="!c.thumbnail_url" class="img-placeholder">{{ c.title.charAt(0) }}</div>
          </div>
          <div class="explore-card-body">
            <span class="badge" [class]="'badge-' + c.level">{{ c.level }}</span>
            <h4 class="explore-title">{{ c.title }}</h4>
            <p class="explore-instructor">{{ c.instructor_name }}</p>
            <div class="explore-meta">
              <span>{{ c.category_name }}</span>
              <span>{{ c.duration_hours }}h</span>
            </div>
            <a [routerLink]="['/courses', c.id]" class="btn btn-outline btn-sm">View Course</a>
          </div>
        </div>
      </div>
      <div class="spinner" *ngIf="loadingCourses"></div>
    </div>
  `,
    styles: [`
    .greeting-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 48px;
    }
    .greeting-sub { color: var(--color-text-muted); font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; }
    .greeting-name { font-family: var(--font-heading); font-size: 3rem; color: var(--color-ivory); margin: 4px 0 12px; }
    .greeting-desc { color: var(--color-ivory-dim); }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 16px;
    }
    .stat-card {
      background: var(--color-card-dark);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 28px 24px;
      text-align: center;
      transition: var(--transition);
    }
    .stat-card:hover { border-color: rgba(212,130,10,0.4); transform: translateY(-2px); }
    .stat-number { font-family: var(--font-heading); font-size: 2.8rem; font-weight: 900; color: var(--color-accent); }
    .stat-label { color: var(--color-text-muted); font-size: 0.85rem; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }

    .course-card {
      background: var(--color-card-dark);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 24px;
      transition: var(--transition);
    }
    .course-card:hover { border-color: rgba(212,130,10,0.4); transform: translateY(-2px); }
    .course-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .course-duration { color: var(--color-text-muted); font-size: 0.85rem; }
    .course-title { font-family: var(--font-heading); font-size: 1.3rem; color: var(--color-ivory); margin-bottom: 6px; }
    .course-instructor { color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 0; }
    .progress-label { color: var(--color-text-muted); font-size: 0.8rem; margin-bottom: 16px; }

    .filter-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
    .pill {
      padding: 8px 18px;
      border: 1.5px solid var(--color-border);
      border-radius: 100px;
      background: transparent;
      color: var(--color-ivory-dim);
      font-family: var(--font-body);
      font-size: 0.85rem;
      cursor: pointer;
      transition: var(--transition);
    }
    .pill.active, .pill:hover { border-color: var(--color-accent); color: var(--color-accent); }

    .explore-card {
      background: var(--color-card-dark);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: var(--transition);
    }
    .explore-card:hover { border-color: rgba(212,130,10,0.4); transform: translateY(-3px); box-shadow: var(--shadow-glow); }
    .explore-card-img { height: 160px; overflow: hidden; }
    .explore-card-img img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder {
      width: 100%; height: 100%;
      background: linear-gradient(135deg, var(--color-surface), var(--color-bg-alt));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-size: 4rem; color: var(--color-accent); opacity: 0.6;
    }
    .explore-card-body { padding: 20px; }
    .explore-title { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-ivory); margin: 10px 0 6px; }
    .explore-instructor { color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 12px; }
    .explore-meta { display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: 0.8rem; margin-bottom: 16px; }
    .btn-sm { padding: 8px 18px; font-size: 0.85rem; }

    @media (max-width: 900px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
      .greeting-name { font-size: 2rem; }
    }
  `],
})
export class StudentDashboardComponent implements OnInit {
    user: User | null = null;
    enrollments: Enrollment[] = [];
    certificates: Certificate[] = [];
    allCourses: Course[] = [];
    inProgress: Enrollment[] = [];
    completedCount = 0;
    avgProgress = 0;
    loadingCourses = true;
    activeCategory: string | null = null;
    categories: string[] = [];

    get filteredCourses(): Course[] {
        if (!this.activeCategory) return this.allCourses;
        return this.allCourses.filter(c => c.category_name === this.activeCategory);
    }

    constructor(
        private auth: AuthService,
        private enrollmentSvc: EnrollmentService,
        private certSvc: CertificateService,
        private courseSvc: CourseService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.user = this.auth.currentUser();
        this.loadData();
    }

    loadData(): void {
        this.enrollmentSvc.getMyEnrollments().subscribe(enrollments => {
            this.enrollments = enrollments;
            this.inProgress = enrollments.filter(e => !e.completed);
            this.completedCount = enrollments.filter(e => e.completed).length;
            this.avgProgress = enrollments.length
                ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
                : 0;
        });

        this.certSvc.getMyCertificates().subscribe(certs => {
            this.certificates = certs;
        });

        this.courseSvc.getAll().subscribe(courses => {
            this.allCourses = courses;
            this.categories = [...new Set(courses.map(c => c.category_name ?? '').filter(Boolean))];
            this.loadingCourses = false;
        });
    }

    logout(): void { this.auth.logout(); }
}
