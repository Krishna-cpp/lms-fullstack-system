import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="split-layout">
      <div class="split-left">
        <div class="brand-panel">
          <div class="brand-logo">
            <span class="logo-icon">✦</span>
            <span class="logo-text">Acad<span class="accent">emia</span></span>
          </div>
          <h1 class="hero-text">Begin your<br/><em>scholarly</em><br/>journey.</h1>
          <div class="decorative-lines">
            <div class="line"></div>
            <div class="line short"></div>
            <div class="line shorter"></div>
          </div>
        </div>
      </div>

      <div class="split-right">
        <div class="form-container page-enter">
          <div class="form-header">
            <h2>Create Account</h2>
            <p>Join thousands of learners and educators</p>
          </div>

          <!-- Role Toggle -->
          <div class="role-toggle">
            <button
              type="button"
              class="role-tab"
              [class.active]="selectedRole() === 'student'"
              (click)="selectedRole.set('student')">
              🎓 Student
            </button>
            <button
              type="button"
              class="role-tab"
              [class.active]="selectedRole() === 'instructor'"
              (click)="selectedRole.set('instructor')">
              📚 Instructor
            </button>
          </div>

          <div class="alert alert-error" *ngIf="error">{{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" formControlName="name" class="form-control"
                [class.error]="submitted && form.get('name')?.invalid"
                placeholder="Your full name" />
              <span class="field-error" *ngIf="submitted && form.get('name')?.invalid">Name is required (min 2 chars)</span>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" formControlName="email" class="form-control"
                [class.error]="submitted && form.get('email')?.invalid"
                placeholder="you@example.com" />
              <span class="field-error" *ngIf="submitted && form.get('email')?.invalid">Valid email is required</span>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" formControlName="password" class="form-control"
                [class.error]="submitted && form.get('password')?.invalid"
                placeholder="Min. 6 characters" />
              <span class="field-error" *ngIf="submitted && form.get('password')?.invalid">Password must be at least 6 characters</span>
            </div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
              <span *ngIf="!loading">Create Account →</span>
              <span *ngIf="loading">Creating account...</span>
            </button>
          </form>

          <p class="form-footer">
            Already have an account? <a routerLink="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .split-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    .split-left {
      background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 60%, #16213e 100%);
      display: flex; align-items: center; justify-content: center; padding: 60px;
      position: relative; overflow: hidden;
    }
    .split-left::after {
      content: '';
      position: absolute;
      width: 300px; height: 300px;
      border: 1px solid rgba(212,130,10,0.2);
      border-radius: 50%;
      bottom: 60px; left: 60px;
    }
    .brand-panel { max-width: 420px; }
    .brand-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
    .logo-icon { font-size: 2rem; color: var(--color-accent); }
    .logo-text { font-family: var(--font-heading); font-size: 2rem; font-weight: 900; color: var(--color-ivory); }
    .accent { color: var(--color-accent); }
    .hero-text {
      font-family: var(--font-heading);
      font-size: 3.5rem;
      font-weight: 900;
      color: var(--color-ivory);
      line-height: 1.1;
    }
    .hero-text em { color: var(--color-accent); font-style: italic; }
    .decorative-lines { margin-top: 48px; display: flex; flex-direction: column; gap: 8px; }
    .line { height: 2px; background: rgba(212,130,10,0.4); border-radius: 1px; }
    .line { width: 100%; } .line.short { width: 60%; } .line.shorter { width: 30%; }

    .split-right {
      background: var(--color-bg);
      display: flex; align-items: center; justify-content: center; padding: 60px 40px;
    }
    .form-container { width: 100%; max-width: 420px; }
    .form-header { margin-bottom: 28px; }
    .form-header h2 { font-family: var(--font-heading); font-size: 2.2rem; color: var(--color-ivory); margin-bottom: 8px; }
    .form-header p { color: var(--color-text-muted); }

    .role-toggle {
      display: grid; grid-template-columns: 1fr 1fr;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 4px;
      margin-bottom: 28px;
    }
    .role-tab {
      padding: 12px;
      border: none;
      border-radius: calc(var(--radius-sm) - 2px);
      background: transparent;
      color: var(--color-text-muted);
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }
    .role-tab.active {
      background: var(--color-accent);
      color: #fff;
    }
    .btn-full { width: 100%; justify-content: center; padding: 16px; font-size: 1rem; }
    .field-error { font-size: 0.8rem; color: var(--color-error); margin-top: 4px; }
    .form-footer { text-align: center; margin-top: 24px; color: var(--color-text-muted); font-size: 0.9rem; }
    @media (max-width: 768px) {
      .split-layout { grid-template-columns: 1fr; }
      .split-left { display: none; }
      .split-right { padding: 40px 24px; }
    }
  `],
})
export class RegisterComponent {
    selectedRole = signal<'student' | 'instructor'>('student');
    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });
    error = '';
    loading = false;
    submitted = false;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }

    onSubmit(): void {
        this.submitted = true;
        if (this.form.invalid) return;
        this.loading = true;
        this.error = '';

        const payload = { ...this.form.value, role: this.selectedRole() } as any;
        this.auth.register(payload).subscribe({
            next: (res) => {
                this.router.navigate([res.user.role === 'instructor' ? '/instructor' : '/dashboard']);
            },
            error: (err) => {
                this.error = err.error?.error ?? 'Registration failed.';
                this.loading = false;
            },
        });
    }
}
