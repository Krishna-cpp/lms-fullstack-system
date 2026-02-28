import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';

interface CategoryOption { id: number; name: string; }

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a routerLink="/instructor">Dashboard</a></li>
        <li><button class="btn btn-ghost" (click)="logout()">Sign Out</button></li>
      </ul>
    </nav>

    <div class="create-container page-enter">
      <div class="create-header">
        <h1 class="create-title">Create a New <em>Course</em></h1>
        <p class="create-sub">Share your expertise with learners worldwide</p>
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" *ngFor="let s of steps; let i = index" [class.active]="currentStep() === i" [class.done]="currentStep() > i">
          <div class="step-circle">{{ currentStep() > i ? '✓' : i + 1 }}</div>
          <span class="step-label">{{ s }}</span>
        </div>
        <div class="step-line"></div>
      </div>

      <div class="form-card">
        <!-- Step 1: Basic Info -->
        <div *ngIf="currentStep() === 0">
          <h2 class="step-title">Basic Information</h2>
          <p class="step-desc">Tell us about your course</p>

          <form [formGroup]="step1Form">
            <div class="form-group">
              <label class="form-label">Course Title *</label>
              <input type="text" formControlName="title" class="form-control"
                [class.error]="step1Submitted && step1Form.get('title')?.invalid"
                placeholder="e.g. Modern JavaScript Mastery" />
              <span class="field-error" *ngIf="step1Submitted && step1Form.get('title')?.invalid">Title is required (min 3 chars)</span>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea formControlName="description" class="form-control" rows="4"
                placeholder="What will students learn? What makes this course special?"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Thumbnail URL</label>
              <input type="url" formControlName="thumbnail_url" class="form-control"
                placeholder="https://example.com/image.jpg" />
            </div>

            <div class="form-group">
              <label class="form-label">Duration (hours) *</label>
              <input type="number" formControlName="duration_hours" class="form-control"
                [class.error]="step1Submitted && step1Form.get('duration_hours')?.invalid"
                placeholder="e.g. 24" min="0" step="0.5" />
              <span class="field-error" *ngIf="step1Submitted && step1Form.get('duration_hours')?.invalid">Duration must be ≥ 0</span>
            </div>
          </form>
        </div>

        <!-- Step 2: Category & Level -->
        <div *ngIf="currentStep() === 1">
          <h2 class="step-title">Category & Level</h2>
          <p class="step-desc">Help students find your course</p>

          <form [formGroup]="step2Form">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select formControlName="category_id" class="form-control"
                [class.error]="step2Submitted && step2Form.get('category_id')?.invalid">
                <option value="">Select a category</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
              <span class="field-error" *ngIf="step2Submitted && step2Form.get('category_id')?.invalid">Please select a category</span>
            </div>

            <div class="form-group">
              <label class="form-label">Difficulty Level *</label>
              <div class="level-options">
                <label class="level-option" *ngFor="let lvl of levels">
                  <input type="radio" formControlName="level" [value]="lvl.value" />
                  <div class="level-card" [class.selected]="step2Form.get('level')?.value === lvl.value">
                    <span class="level-icon">{{ lvl.icon }}</span>
                    <span class="level-name">{{ lvl.label }}</span>
                    <span class="level-desc">{{ lvl.desc }}</span>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <!-- Step 3: Review -->
        <div *ngIf="currentStep() === 2">
          <h2 class="step-title">Review & Publish</h2>
          <p class="step-desc">Confirm your course details before publishing</p>

          <div class="review-grid">
            <div class="review-item">
              <span class="review-label">Title</span>
              <span class="review-value">{{ step1Form.get('title')?.value }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Duration</span>
              <span class="review-value">{{ step1Form.get('duration_hours')?.value }} hours</span>
            </div>
            <div class="review-item">
              <span class="review-label">Category</span>
              <span class="review-value">{{ getCategoryName(step2Form.get('category_id')?.value) }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Level</span>
              <span class="review-value">{{ step2Form.get('level')?.value | titlecase }}</span>
            </div>
            <div class="review-item full-width" *ngIf="step1Form.get('description')?.value">
              <span class="review-label">Description</span>
              <span class="review-value">{{ step1Form.get('description')?.value }}</span>
            </div>
          </div>

          <div class="alert alert-error" *ngIf="submitError">{{ submitError }}</div>
        </div>

        <!-- Navigation -->
        <div class="form-nav">
          <button class="btn btn-outline" *ngIf="currentStep() > 0" (click)="prevStep()">← Back</button>
          <div style="flex:1"></div>
          <button class="btn btn-primary" *ngIf="currentStep() < 2" (click)="nextStep()">
            Continue →
          </button>
          <button class="btn btn-primary" *ngIf="currentStep() === 2" (click)="submit()" [disabled]="submitting">
            {{ submitting ? 'Publishing...' : '🚀 Publish Course' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-container { max-width: 720px; margin: 0 auto; padding: 40px 24px 60px; }
    .create-header { margin-bottom: 40px; }
    .create-title { font-family: var(--font-heading); font-size: 2.8rem; color: var(--color-ivory); margin-bottom: 8px; }
    .create-title em { color: var(--color-accent); font-style: italic; }
    .create-sub { color: var(--color-text-muted); }

    .step-indicator {
      display: flex; align-items: center; gap: 0;
      margin-bottom: 40px; position: relative;
    }
    .step {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      flex: 1; position: relative; z-index: 1;
    }
    .step-circle {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.06); border: 2px solid var(--color-border);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: var(--color-text-muted); font-size: 0.9rem;
      transition: var(--transition);
    }
    .step.active .step-circle { border-color: var(--color-accent); color: var(--color-accent); background: rgba(212,130,10,0.1); }
    .step.done .step-circle { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }
    .step-label { font-size: 0.75rem; color: var(--color-text-muted); text-align: center; }
    .step.active .step-label { color: var(--color-ivory); }
    .step-line {
      position: absolute; top: 20px; left: 0; right: 0; height: 2px;
      background: var(--color-border); z-index: 0;
    }

    .form-card {
      background: var(--color-card-dark); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); padding: 40px;
    }
    .step-title { font-family: var(--font-heading); font-size: 1.8rem; color: var(--color-ivory); margin-bottom: 6px; }
    .step-desc { color: var(--color-text-muted); margin-bottom: 32px; }

    .level-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .level-option { cursor: pointer; }
    .level-option input { display: none; }
    .level-card {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 20px 16px; border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md); transition: var(--transition); text-align: center;
    }
    .level-card:hover { border-color: var(--color-accent); }
    .level-card.selected { border-color: var(--color-accent); background: rgba(212,130,10,0.08); }
    .level-icon { font-size: 1.8rem; }
    .level-name { color: var(--color-ivory); font-weight: 600; font-size: 0.9rem; }
    .level-desc { color: var(--color-text-muted); font-size: 0.75rem; }

    .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .review-item { background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 16px; }
    .review-item.full-width { grid-column: 1 / -1; }
    .review-label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 6px; }
    .review-value { color: var(--color-ivory); font-size: 0.95rem; }

    .form-nav { display: flex; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--color-border); }
    .field-error { font-size: 0.8rem; color: var(--color-error); margin-top: 4px; }
  `],
})
export class CreateCourseComponent implements OnInit {
  currentStep = signal(0);
  steps = ['Basic Info', 'Category & Level', 'Review'];
  step1Submitted = false;
  step2Submitted = false;
  submitting = false;
  submitError = '';

  categories: CategoryOption[] = [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'Data Science' },
  ];

  levels = [
    { value: 'beginner', label: 'Beginner', icon: '🌱', desc: 'No prior knowledge needed' },
    { value: 'intermediate', label: 'Intermediate', icon: '📈', desc: 'Some experience required' },
    { value: 'advanced', label: 'Advanced', icon: '🚀', desc: 'Expert-level content' },
  ];

  step1Form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    thumbnail_url: [''],
    duration_hours: [0, [Validators.required, Validators.min(0)]],
  });

  step2Form = this.fb.group({
    category_id: ['', Validators.required],
    level: ['beginner', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private courseSvc: CourseService,
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void { }

  nextStep(): void {
    if (this.currentStep() === 0) {
      this.step1Submitted = true;
      if (this.step1Form.invalid) return;
    }
    if (this.currentStep() === 1) {
      this.step2Submitted = true;
      if (this.step2Form.invalid) return;
    }
    this.currentStep.update(s => s + 1);
  }

  prevStep(): void {
    this.currentStep.update(s => s - 1);
  }

  getCategoryName(id: string | number | null | undefined): string {
    if (id == null) return '—';
    return this.categories.find(c => c.id === Number(id))?.name ?? '—';
  }

  submit(): void {
    this.submitting = true;
    this.submitError = '';

    const payload = {
      ...this.step1Form.value,
      ...this.step2Form.value,
      category_id: Number(this.step2Form.get('category_id')?.value),
      duration_hours: Number(this.step1Form.get('duration_hours')?.value),
    };

    this.courseSvc.create(payload as any).subscribe({
      next: (course) => {
        this.router.navigate(['/instructor']);
      },
      error: (err) => {
        this.submitError = err.error?.error ?? 'Failed to create course.';
        this.submitting = false;
      },
    });
  }

  logout(): void { this.auth.logout(); }
}
