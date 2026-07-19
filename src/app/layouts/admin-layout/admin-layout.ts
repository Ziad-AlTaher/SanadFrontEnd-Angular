import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ThemeService } from '../../core/services/theme.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    ButtonModule,
    TranslatePipe,
  ],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css'],
})
export class AdminLayoutComponent {
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);

  sidebarCollapsed = signal(true);

  theme = this.themeService.theme;
  currentLang = this.translationService.currentLang;

  navItems = [
    { labelKey: 'admin.nav.dashboard', icon: 'pi pi-th-large', route: '/admin/dashboard' },
    { labelKey: 'admin.nav.beneficiaries', icon: 'pi pi-users', route: '/admin/beneficiaries' },
    { labelKey: 'admin.nav.aidTypes', icon: 'pi pi-tags', route: '/admin/aid-types' },
    { labelKey: 'admin.nav.aidDisbursements', icon: 'pi pi-wallet', route: '/admin/aid-disbursements' },
    { labelKey: 'admin.nav.bulkDisbursements', icon: 'pi pi-list-check', route: '/admin/aid-disbursements/bulk' },
    { labelKey: 'admin.nav.donations', icon: 'pi pi-dollar', route: '/admin/donations' },
    { labelKey: 'admin.nav.users', icon: 'pi pi-user-edit', route: '/admin/users' },

  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleLanguage() {
    this.translationService.toggleLanguage();
  }
}
