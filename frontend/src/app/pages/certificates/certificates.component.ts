import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CertificateService } from '../../core/services/certificate.service';
import { Certificate } from '../../shared/models';

@Component({
    selector: 'app-certificates',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a routerLink="/dashboard">Dashboard</a></li>
        <li><a routerLink="/courses">Courses</a></li>
        <li><a routerLink="/certificates" class="active">Certificates</a></li>
        <li><button class="btn btn-ghost" (click)="logout()">Sign Out</button></li>
      </ul>
    </nav>

    <div class="container page-enter" style="padding-top:48px; padding-bottom:60px;">
      <div class="certs-header">
        <h1 class="certs-title">Your <em>Certificates</em></h1>
        <p class="certs-sub">Proof of your dedication and expertise</p>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div class="empty-state" *ngIf="!loading && certificates.length === 0">
        <div class="empty-icon">🎓</div>
        <h2>No Certificates Yet</h2>
        <p>Complete a course to earn your first certificate.</p>
        <a routerLink="/courses" class="btn btn-primary">Browse Courses</a>
      </div>

      <div class="certs-grid" *ngIf="!loading && certificates.length > 0">
        <div class="cert-card" *ngFor="let cert of certificates">
          <div class="cert-ribbon">Certificate of Completion</div>
          <div class="cert-emblem">✦</div>
          <h3 class="cert-course">{{ cert.course_title }}</h3>
          <p class="cert-name">Awarded to <strong>{{ user?.name }}</strong></p>
          <div class="cert-details">
            <div class="cert-detail">
              <span class="detail-label">Issued</span>
              <span class="detail-value">{{ cert.issued_at | date:'longDate' }}</span>
            </div>
            <div class="cert-detail" *ngIf="cert.score !== null && cert.score !== undefined">
              <span class="detail-label">Score</span>
              <span class="detail-value score-badge">{{ cert.score }}%</span>
            </div>
          </div>
          <div class="cert-actions">
            <button class="btn btn-primary btn-sm">Download PDF</button>
            <button class="btn btn-outline btn-sm">Share</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .certs-header { margin-bottom: 48px; }
    .certs-title { font-family: var(--font-heading); font-size: 3rem; color: var(--color-ivory); margin-bottom: 10px; }
    .certs-title em { color: var(--color-accent); font-style: italic; }
    .certs-sub { color: var(--color-text-muted); font-size: 1.05rem; }

    .empty-state { text-align: center; padding: 80px 0; }
    .empty-icon { font-size: 4rem; margin-bottom: 20px; }
    .empty-state h2 { font-family: var(--font-heading); font-size: 2rem; color: var(--color-ivory); margin-bottom: 12px; }
    .empty-state p { color: var(--color-text-muted); margin-bottom: 28px; }

    .certs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px; }

    .cert-card {
      background: linear-gradient(135deg, #22223b 0%, #1a1a2e 100%);
      border: 1px solid rgba(212,130,10,0.3);
      border-radius: var(--radius-lg);
      padding: 36px 28px;
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: var(--transition);
    }
    .cert-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at top, rgba(212,130,10,0.08) 0%, transparent 60%);
      pointer-events: none;
    }
    .cert-card:hover { border-color: var(--color-accent); transform: translateY(-4px); box-shadow: var(--shadow-glow); }

    .cert-ribbon {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--color-accent);
      margin-bottom: 16px;
    }
    .cert-emblem {
      font-size: 2.5rem;
      color: var(--color-accent);
      margin-bottom: 16px;
      display: block;
    }
    .cert-course { font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-ivory); margin-bottom: 10px; line-height: 1.3; }
    .cert-name { color: var(--color-ivory-dim); font-size: 0.9rem; margin-bottom: 24px; }
    .cert-name strong { color: var(--color-ivory); }

    .cert-details { display: flex; justify-content: center; gap: 28px; margin-bottom: 24px; }
    .cert-detail { text-align: center; }
    .detail-label { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 4px; }
    .detail-value { font-family: var(--font-heading); font-size: 0.95rem; color: var(--color-ivory); }
    .score-badge { color: var(--color-accent); font-size: 1.2rem; }

    .cert-actions { display: flex; gap: 10px; justify-content: center; }
    .btn-sm { padding: 8px 18px; font-size: 0.85rem; }
  `],
})
export class CertificatesComponent implements OnInit {
    certificates: Certificate[] = [];
    loading = true;
    user = this.auth.currentUser();

    constructor(private certSvc: CertificateService, private auth: AuthService) { }

    ngOnInit(): void {
        this.certSvc.getMyCertificates().subscribe({
            next: (certs) => { this.certificates = certs; this.loading = false; },
            error: () => { this.loading = false; },
        });
    }

    logout(): void { this.auth.logout(); }
}
