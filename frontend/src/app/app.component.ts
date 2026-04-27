import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showSidebar: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check after router has finished initial navigation
    setTimeout(() => {
      this.showSidebar = !this.isAuthRoute(this.router.url);
    }, 0);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = !this.isAuthRoute(event.url);
      }
    });
  }

  isAuthRoute(url: string): boolean {
    return url.includes('/login') || url.includes('/signup');
  }
}