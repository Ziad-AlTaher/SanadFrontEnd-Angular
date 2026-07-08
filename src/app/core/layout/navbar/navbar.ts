import { Component, computed, inject, signal, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BaseComponent } from '../../base/base.component';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, ButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent extends BaseComponent {
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentLang = computed(() => this.translationService.currentLang());
  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  isSidebarOpen = false;

  /** Tracks which section is currently active for nav highlighting */
  activeSection = signal<string>('hero');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    super();
  }

  /** Listen to scroll events to update active section highlight */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const sections = ['contact', 'services', 'about', 'hero'];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Section is "active" when its top is within 150px of viewport top
        if (rect.top <= 150) {
          this.activeSection.set(id);
          return;
        }
      }
    }
    this.activeSection.set('hero');
  }

  /** Smooth-scroll to a section by its element id. Safe for SSR. */
  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // If we're not on the home route, navigate first then scroll
    if (this.router.url !== '/' && this.router.url !== '') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.doScroll(sectionId), 100);
      });
      return;
    }
    this.doScroll(sectionId);
  }

  private doScroll(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection.set(sectionId);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  goToAuth(): void {
    this.closeSidebar();
    this.router.navigate(['/auth']);
  }

  goToDashboard(): void {
    this.closeSidebar();
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.closeSidebar();
    this.router.navigate(['/']);
  }
}
