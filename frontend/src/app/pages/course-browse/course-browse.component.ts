import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { Course } from '../../shared/models';

@Component({
  selector: 'app-course-browse',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a [routerLink]="user?.role === 'instructor' ? '/instructor' : '/dashboard'">Dashboard</a></li>
        <li><a routerLink="/courses" class="active">Courses</a></li>
        <li *ngIf="user?.role === 'student'"><a routerLink="/certificates">Certificates</a></li>
        <li><button class="btn btn-ghost" (click)="logout()">Sign Out</button></li>
      </ul>
    </nav>

    <!-- Hero Header -->
    <div class="browse-hero">
      <div class="container">
        <h1 class="browse-title">Discover <em>Knowledge</em></h1>
        <p class="browse-subtitle">Explore our curated collection of expert-led courses</p>
        <div class="search-bar">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search courses, topics, instructors..."
            class="search-input" (input)="applyFilters()" />
          <span class="search-icon">⌕</span>
        </div>
      </div>
    </div>

    <div class="container browse-layout page-enter">
      <!-- Filter Sidebar -->
      <aside class="filter-sidebar">
        <h3 class="filter-title">Filters</h3>

        <div class="filter-section">
          <h4 class="filter-label">Category</h4>
          <div class="filter-options">
            <label class="filter-option" *ngFor="let cat of categories">
              <input type="radio" name="category" [value]="cat" [(ngModel)]="selectedCategory"
                (change)="applyFilters()" />
              <span>{{ cat }}</span>
            </label>
            <label class="filter-option">
              <input type="radio" name="category" value="" [(ngModel)]="selectedCategory"
                (change)="applyFilters()" />
              <span>All Categories</span>
            </label>
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-label">Level</h4>
          <div class="filter-options">
            <label class="filter-option" *ngFor="let lvl of levels">
              <input type="radio" name="level" [value]="lvl" [(ngModel)]="selectedLevel"
                (change)="applyFilters()" />
              <span>{{ lvl | titlecase }}</span>
            </label>
            <label class="filter-option">
              <input type="radio" name="level" value="" [(ngModel)]="selectedLevel"
                (change)="applyFilters()" />
              <span>All Levels</span>
            </label>
          </div>
        </div>

        <button class="btn btn-ghost" style="width:100%; margin-top:16px;" (click)="clearFilters()">
          Clear Filters
        </button>
      </aside>

      <!-- Course Grid -->
      <main class="course-grid-area">
        <div class="results-header">
          <span class="results-count">{{ filtered.length }} course{{ filtered.length !== 1 ? 's' : '' }} found</span>
        </div>

        <div class="spinner" *ngIf="loading"></div>

        <div class="course-grid" *ngIf="!loading">
          <div class="course-card-browse" *ngFor="let c of filtered">
            <div class="card-img">
              <img *ngIf="c.thumbnail_url" [src]="c.thumbnail_url" [alt]="c.title" />
              <div *ngIf="!c.thumbnail_url" class="img-placeholder">{{ c.title.charAt(0) }}</div>
              <span class="card-level badge" [class]="'badge-' + c.level">{{ c.level }}</span>
            </div>
            <div class="card-body">
              <p class="card-category">{{ c.category_name }}</p>
              <h3 class="card-title">{{ c.title }}</h3>
              <p class="card-instructor">{{ c.instructor_name }}</p>
              <p class="card-desc">{{ c.description | slice:0:100 }}{{ (c.description?.length ?? 0) > 100 ? '...' : '' }}</p>
              <div class="card-footer">
                <span class="card-duration">{{ c.duration_hours }}h total</span>
                <a [routerLink]="['/courses', c.id]" class="btn btn-primary btn-sm">Enroll Now</a>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && filtered.length === 0">
          <p>No courses match your filters.</p>
          <button class="btn btn-outline" (click)="clearFilters()">Clear Filters</button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .browse-hero {
      background: linear-gradient(135deg, var(--color-bg-alt) 0%, var(--color-surface) 100%);
      padding: 64px 0 48px;
      border-bottom: 1px solid var(--color-border);
    }
    .browse-title { font-family: var(--font-heading); font-size: 3.5rem; color: var(--color-ivory); margin-bottom: 12px; }
    .browse-title em { color: var(--color-accent); font-style: italic; }
    .browse-subtitle { color: var(--color-ivory-dim); margin-bottom: 32px; font-size: 1.1rem; }
    .search-bar { position: relative; max-width: 560px; }
    .search-input {
      width: 100%; padding: 16px 20px 16px 48px;
      background: rgba(255,255,255,0.08); border: 1.5px solid var(--color-border);
      border-radius: var(--radius-lg); color: var(--color-ivory);
      font-family: var(--font-body); font-size: 1rem; outline: none; transition: var(--transition);
    }
    .search-input:focus { border-color: var(--color-accent); background: rgba(212,130,10,0.05); }
    .search-input::placeholder { color: var(--color-text-muted); }
    .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); font-size: 1.3rem; }

    .browse-layout { display: grid; grid-template-columns: 240px 1fr; gap: 40px; padding-top: 40px; padding-bottom: 60px; }
    .filter-sidebar { }
    .filter-title { font-family: var(--font-heading); font-size: 1.2rem; color: var(--color-ivory); margin-bottom: 24px; }
    .filter-section { margin-bottom: 28px; }
    .filter-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 12px; }
    .filter-options { display: flex; flex-direction: column; gap: 10px; }
    .filter-option { display: flex; align-items: center; gap: 10px; color: var(--color-ivory-dim); cursor: pointer; font-size: 0.9rem; }
    .filter-option input { accent-color: var(--color-accent); }
    .filter-option:hover { color: var(--color-ivory); }

    .results-header { margin-bottom: 24px; }
    .results-count { color: var(--color-text-muted); font-size: 0.9rem; }
    .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

    .course-card-browse {
      background: var(--color-card-dark); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); overflow: hidden; transition: var(--transition);
    }
    .course-card-browse:hover { border-color: rgba(212,130,10,0.4); transform: translateY(-4px); box-shadow: var(--shadow-glow); }
    .card-img { height: 180px; position: relative; overflow: hidden; }
    .card-img img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder {
      width: 100%; height: 100%;
      background: linear-gradient(135deg, var(--color-surface), var(--color-bg-alt));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-size: 5rem; color: var(--color-accent); opacity: 0.5;
    }
    .card-level { position: absolute; top: 12px; right: 12px; }
    .card-body { padding: 20px; }
    .card-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-accent); margin-bottom: 8px; }
    .card-title { font-family: var(--font-heading); font-size: 1.15rem; color: var(--color-ivory); margin-bottom: 6px; line-height: 1.3; }
    .card-instructor { color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 10px; }
    .card-desc { color: var(--color-ivory-dim); font-size: 0.85rem; line-height: 1.5; margin-bottom: 16px; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .card-duration { color: var(--color-text-muted); font-size: 0.8rem; }
    .btn-sm { padding: 8px 18px; font-size: 0.85rem; }
    .empty-state { text-align: center; padding: 60px; color: var(--color-text-muted); }
    .empty-state p { margin-bottom: 20px; font-size: 1.1rem; }

    @media (max-width: 900px) {
      .browse-layout { grid-template-columns: 1fr; }
      .filter-sidebar { display: flex; gap: 20px; flex-wrap: wrap; }
      .filter-section { margin-bottom: 0; }
    }
  `],
})
export class CourseBrowseComponent implements OnInit {
  allCourses: Course[] = [];
  filtered: Course[] = [];
  categories: string[] = [];
  levels = ['beginner', 'intermediate', 'advanced'];
  searchQuery = '';
  selectedCategory = '';
  selectedLevel = '';
  loading = true;
  user = this.auth.currentUser();

  constructor(
    private courseSvc: CourseService,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.courseSvc.getAll().subscribe(courses => {
      this.allCourses = courses;
      this.categories = [...new Set(courses.map(c => c.category_name ?? '').filter(Boolean))];
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filtered = this.allCourses.filter(c => {
      const matchSearch = !this.searchQuery ||
        c.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.instructor_name ?? '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.category_name ?? '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = !this.selectedCategory || c.category_name === this.selectedCategory;
      const matchLevel = !this.selectedLevel || c.level === this.selectedLevel;
      return matchSearch && matchCat && matchLevel;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedLevel = '';
    this.applyFilters();
  }

  logout(): void { this.auth.logout(); }
}
