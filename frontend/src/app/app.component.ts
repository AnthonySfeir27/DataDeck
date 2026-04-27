import { Component, OnInit } from '@angular/core';
import { WelcomeService } from './services/welcome.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  welcomeMessage: string = '';

  constructor(private welcomeService: WelcomeService) {}

  ngOnInit(): void {
    this.welcomeService.getWelcomeMessage().subscribe({
      next: (data) => {
        this.welcomeMessage = data.message;
      },
      error: (error) => {
        console.error('Error fetching welcome message:', error);
        this.welcomeMessage = 'Welcome to DataDeck';
      }
    });
  }
}
