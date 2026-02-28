import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="split-layout">
      <!-- Left Panel -->
      <div class="split-left">
        <div class="brand-panel">
          <div class="brand-logo">
            <span class="logo-icon">✦</span>
            <span class="logo-text">Acad<span class="accent">emia</span></span>
          </div>
          <blockquote class="hero-quote">
            "Education is not the filling of a pail, but the lighting of a fire."
          </blockquote>
          <cite class="quote-author">— William Butler Yeats</cite>
          <div class="decorative-lines">
            <div class="line"></div>
            <div class="line short"></div>
            <div class="line shorter"></div>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="split-right">
        <div class="form-container page-enter">
          <div class="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue your learning journey</p>
          </div>

          <div class="alert alert-error" *ngIf="error">{{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                [class.error]="submitted && form.get('email')?.invalid"
                placeholder="you@example.com"
              />
              <span class="field-error" *ngIf="submitted && form.get('email')?.invalid">
                Valid email is required
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input
                type="password"
                formControlName="password"
                class="form-control"
                [class.error]="submitted && form.get('password')?.invalid"
                placeholder="••••••••"
              />
              <span class="field-error" *ngIf="submitted && form.get('password')?.invalid">
                Password is required
              </span>
            </div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
              <span *ngIf="!loading">Sign In →</span>
              <span *ngIf="loading">Signing in...</span>
            </button>
          </form>

          <p class="form-footer">
            Don't have an account? <a routerLink="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .split-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
    }
    .split-left {
      background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 60%, #16213e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }
    .split-left::before {
      content: '';
      position: absolute;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,130,10,0.15) 0%, transparent 70%);
      top: -100px; right: -100px;
    }
    .brand-panel { max-width: 420px; }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 60px;
    }
    .logo-icon {
      font-size: 2rem;
      color: var(--color-accent);
    }
    .logo-text {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 900;
      color: var(--color-ivory);
    }
    .accent { color: var(--color-accent); }
    .hero-quote {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-style: italic;
      color: var(--color-ivory);
      line-height: 1.4;
      margin-bottom: 20px;
      border: none;
    }
    .quote-author {
      font-size: 0.9rem;
      color: var(--color-ivory-dim);
      letter-spacing: 0.1em;
    }
    .decorative-lines {
      margin-top: 48px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .line { height: 2px; background: rgba(212,130,10,0.4); border-radius: 1px; }
    .line { width: 100%; }
    .line.short { width: 60%; }
    .line.shorter { width: 30%; }

    .split-right {
      background: var(--color-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 40px;
    }
    .form-container { width: 100%; max-width: 400px; }
    .form-header { margin-bottom: 36px; }
    .form-header h2 {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      color: var(--color-ivory);
      margin-bottom: 8px;
    }
    .form-header p { color: var(--color-text-muted); }
    .btn-full { width: 100%; justify-content: center; padding: 16px; font-size: 1rem; }
    .field-error { font-size: 0.8rem; color: var(--color-error); margin-top: 4px; }
    .form-footer {
      text-align: center;
      margin-top: 24px;
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }
    @media (max-width: 768px) {
      .split-layout { grid-template-columns: 1fr; }
      .split-left { display: none; }
      .split-right { padding: 40px 24px; }
    }
  `],
})
export class LoginComponent {
    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
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

        this.auth.login(this.form.value as any).subscribe({
            next: (res) => {
                const role = res.user.role;
                this.router.navigate([role === 'instructor' || role === 'admin' ? '/instructor' : '/dashboard']);
            },
            error: (err) => {
                this.error = err.error?.error ?? 'Login failed. Please try again.';
                this.loading = false;
            },
        });
    }
}
