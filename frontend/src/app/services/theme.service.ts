import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'datadeck_theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getSavedTheme());

  isDark$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.getSavedTheme());
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.THEME_KEY);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  }

  getTheme(): Theme {
    return this.themeSubject.value;
  }

  isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.isDark() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    } else {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    }
  }
}
