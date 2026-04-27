import { Component, OnInit } from '@angular/core';
import { WelcomeService } from '../services/welcome.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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
