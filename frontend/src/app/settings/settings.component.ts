import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService, Theme } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { CardsService } from '../services/cards.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  isDark: boolean = true;
  notificationsEnabled: boolean = false;
  cardsPerRow: number = 5;
  showDeleteConfirm: boolean = false;
  deleteConfirmText: string = '';
  successMessage: string = '';
  appVersion: string = '1.0.0';

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private cardsService: CardsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDark = this.themeService.isDark();
    const savedNotif = localStorage.getItem('datadeck_notifications');
    this.notificationsEnabled = savedNotif === 'true';
    const savedCpr = localStorage.getItem('datadeck_cards_per_row');
    if (savedCpr) this.cardsPerRow = parseInt(savedCpr, 10);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark = this.themeService.isDark();
  }

  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
    localStorage.setItem('datadeck_notifications', String(this.notificationsEnabled));
    if (this.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  }

  setCardsPerRow(count: number): void {
    this.cardsPerRow = count;
    localStorage.setItem('datadeck_cards_per_row', String(count));
  }

  exportData(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.cardsService.getCards(user.id).subscribe({
      next: (response: any) => {
        const data = {
          exportedAt: new Date().toISOString(),
          user: { username: user.username, email: user.email },
          cards: response.cards
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datadeck-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.successMessage = 'Data exported successfully';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      }
    });
  }

  showDeleteDialog(): void {
    this.showDeleteConfirm = true;
    this.deleteConfirmText = '';
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteConfirmText = '';
  }

  confirmDelete(): void {
    if (this.deleteConfirmText !== 'DELETE') return;
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.authService.deleteAccount(user.id).subscribe({
      next: () => {
        this.authService.logout();
        localStorage.removeItem('datadeck_theme');
        localStorage.removeItem('datadeck_notifications');
        localStorage.removeItem('datadeck_cards_per_row');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.showDeleteConfirm = false;
      }
    });
  }
}
