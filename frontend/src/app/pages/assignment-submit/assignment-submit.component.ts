import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../core/services/assignment.service';
import { SubmissionService } from '../../core/services/submission.service';
import { Assignment } from '../../shared/models';

@Component({
    selector: 'app-assignment-submit',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a routerLink="/dashboard">Dashboard</a></li>
      </ul>
    </nav>

    <div class="assignment-container page-enter">
      <div class="spinner" *ngIf="loading"></div>

      <div *ngIf="!loading && assignments.length === 0" class="empty-state">
        <h2>No Assignments</h2>
        <p>There are no assignments for this lesson yet.</p>
        <a routerLink="/dashboard" class="btn btn-outline">Back to Dashboard</a>
      </div>

      <div *ngIf="!loading && assignments.length > 0">
        <div class="page-header">
          <h1 class="page-title">Assignments</h1>
          <p class="page-sub">Submit your work for review</p>
        </div>

        <div class="assignment-card" *ngFor="let a of assignments">
          <div class="assignment-header">
            <div>
              <h2 class="assignment-title">{{ a.title }}</h2>
              <p class="assignment-desc">{{ a.description }}</p>
            </div>
            <div class="assignment-meta">
              <div class="meta-item">
                <span class="meta-label">Max Score</span>
                <span class="meta-value">{{ a.max_score }}</span>
              </div>
              <div class="meta-item" *ngIf="a.due_date">
                <span class="meta-label">Due Date</span>
                <span class="meta-value">{{ a.due_date | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>

          <!-- Success State -->
          <div class="success-card" *ngIf="submitted[a.id]">
            <div class="success-icon">✓</div>
            <h3>Submission Received!</h3>
            <p>Your file has been uploaded successfully. Your instructor will review it shortly.</p>
            <a routerLink="/dashboard" class="btn btn-outline">Back to Dashboard</a>
          </div>

          <!-- Upload Form -->
          <div class="upload-section" *ngIf="!submitted[a.id]">
            <div
              class="drop-zone"
              [class.dragging]="dragging[a.id]"
              [class.has-file]="selectedFiles[a.id]"
              (dragover)="onDragOver($event, a.id)"
              (dragleave)="dragging[a.id] = false"
              (drop)="onDrop($event, a.id)"
              (click)="fileInput.click()">
              <input #fileInput type="file" hidden (change)="onFileSelect($event, a.id)" />
              <div class="drop-icon">{{ selectedFiles[a.id] ? '📄' : '📁' }}</div>
              <div class="drop-text" *ngIf="!selectedFiles[a.id]">
                <strong>Drag & drop your file here</strong>
                <span>or click to browse</span>
                <span class="drop-hint">PDF, DOC, DOCX, ZIP, TXT, PNG, JPG (max 10MB)</span>
              </div>
              <div class="drop-text" *ngIf="selectedFiles[a.id]">
                <strong>{{ selectedFiles[a.id]?.name }}</strong>
                <span>{{ (selectedFiles[a.id]?.size ?? 0) / 1024 | number:'1.0-0' }} KB</span>
                <span class="drop-hint">Click to change file</span>
              </div>
            </div>

            <div class="alert alert-error" *ngIf="errors[a.id]">{{ errors[a.id] }}</div>

            <button
              class="btn btn-primary"
              [disabled]="!selectedFiles[a.id] || submitting[a.id]"
              (click)="submit(a)">
              {{ submitting[a.id] ? 'Uploading...' : 'Submit Assignment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .assignment-container { max-width: 760px; margin: 0 auto; padding: 40px 24px 60px; }
    .page-header { margin-bottom: 36px; }
    .page-title { font-family: var(--font-heading); font-size: 2.5rem; color: var(--color-ivory); margin-bottom: 8px; }
    .page-sub { color: var(--color-text-muted); }
    .empty-state { text-align: center; padding: 80px 0; }
    .empty-state h2 { font-family: var(--font-heading); color: var(--color-ivory); margin-bottom: 12px; }
    .empty-state p { color: var(--color-text-muted); margin-bottom: 24px; }

    .assignment-card {
      background: var(--color-card-dark); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); padding: 32px; margin-bottom: 28px;
    }
    .assignment-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 28px; }
    .assignment-title { font-family: var(--font-heading); font-size: 1.6rem; color: var(--color-ivory); margin-bottom: 10px; }
    .assignment-desc { color: var(--color-ivory-dim); line-height: 1.6; }
    .assignment-meta { display: flex; gap: 20px; flex-shrink: 0; }
    .meta-item { text-align: center; }
    .meta-label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 4px; }
    .meta-value { font-family: var(--font-heading); font-size: 1.3rem; color: var(--color-accent); }

    .drop-zone {
      border: 2px dashed var(--color-border); border-radius: var(--radius-md);
      padding: 48px 32px; text-align: center; cursor: pointer;
      transition: var(--transition); margin-bottom: 20px;
    }
    .drop-zone:hover, .drop-zone.dragging { border-color: var(--color-accent); background: rgba(212,130,10,0.04); }
    .drop-zone.has-file { border-color: var(--color-sage); background: rgba(122,158,126,0.04); }
    .drop-icon { font-size: 3rem; margin-bottom: 16px; }
    .drop-text { display: flex; flex-direction: column; gap: 6px; }
    .drop-text strong { color: var(--color-ivory); font-size: 1rem; }
    .drop-text span { color: var(--color-text-muted); font-size: 0.85rem; }
    .drop-hint { font-size: 0.75rem !important; color: var(--color-text-muted) !important; }

    .success-card {
      text-align: center; padding: 40px;
      background: rgba(122,158,126,0.08); border: 1px solid rgba(122,158,126,0.3);
      border-radius: var(--radius-md);
    }
    .success-icon { font-size: 3rem; color: var(--color-sage); margin-bottom: 16px; }
    .success-card h3 { font-family: var(--font-heading); color: var(--color-ivory); margin-bottom: 8px; }
    .success-card p { color: var(--color-ivory-dim); margin-bottom: 24px; }
  `],
})
export class AssignmentSubmitComponent implements OnInit {
    assignments: Assignment[] = [];
    loading = true;
    selectedFiles: Record<number, File | null> = {};
    dragging: Record<number, boolean> = {};
    submitting: Record<number, boolean> = {};
    submitted: Record<number, boolean> = {};
    errors: Record<number, string> = {};

    constructor(
        private route: ActivatedRoute,
        private assignSvc: AssignmentService,
        private subSvc: SubmissionService,
    ) { }

    ngOnInit(): void {
        const lessonId = Number(this.route.snapshot.paramMap.get('id'));
        this.assignSvc.getByLesson(lessonId).subscribe({
            next: (a) => { this.assignments = a; this.loading = false; },
            error: () => { this.loading = false; },
        });
    }

    onDragOver(event: DragEvent, id: number): void {
        event.preventDefault();
        this.dragging[id] = true;
    }

    onDrop(event: DragEvent, id: number): void {
        event.preventDefault();
        this.dragging[id] = false;
        const file = event.dataTransfer?.files[0];
        if (file) this.selectedFiles[id] = file;
    }

    onFileSelect(event: Event, id: number): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.[0]) this.selectedFiles[id] = input.files[0];
    }

    submit(assignment: Assignment): void {
        const file = this.selectedFiles[assignment.id];
        if (!file) return;
        this.submitting[assignment.id] = true;
        this.errors[assignment.id] = '';

        this.subSvc.submit(assignment.id, file).subscribe({
            next: () => { this.submitted[assignment.id] = true; this.submitting[assignment.id] = false; },
            error: (err) => {
                this.errors[assignment.id] = err.error?.error ?? 'Submission failed.';
                this.submitting[assignment.id] = false;
            },
        });
    }
}
