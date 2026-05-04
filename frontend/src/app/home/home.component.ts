import { Component, OnInit } from '@angular/core';
import { WelcomeService } from '../services/welcome.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  welcomeMessage: string = '';
  username: string = '';

  steps = [
    {
      icon: 'card',
      title: 'Create Cards',
      description: 'Store any type of information — notes, movies, tasks, or custom data — all in one place.'
    },
    {
      icon: 'tag',
      title: 'Organize with Tags',
      description: 'Create tags and master tags to categorize and filter your cards for quick access.'
    },
    {
      icon: 'search',
      title: 'Search & Filter',
      description: 'Quickly find what you need with powerful search and tag-based filtering.'
    },
    {
      icon: 'theme',
      title: 'Customize',
      description: 'Switch between dark and light themes, adjust display settings, and make DataDeck yours.'
    }
  ];

  constructor(
    private welcomeService: WelcomeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
    }
    this.welcomeService.getWelcomeMessage().subscribe({
      next: (data) => {
        this.welcomeMessage = data.message;
      },
      error: () => {
        this.welcomeMessage = 'Welcome to DataDeck';
      }
    });
  }

  goToCards(): void {
    this.router.navigate(['/cards']);
  }

  goToTags(): void {
    this.router.navigate(['/tags']);
  }
}
