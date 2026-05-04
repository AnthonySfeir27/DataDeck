import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  username: string = '';
  email: string = '';
  userId: string = '';

  // Edit mode
  editingUsername: boolean = false;
  editingEmail: boolean = false;
  newUsername: string = '';
  newEmail: string = '';

  // Password change
  showPasswordForm: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Messages
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
      this.email = user.email || '';
      this.userId = user.id;
    }
  }

  startEditUsername(): void {
    this.editingUsername = true;
    this.newUsername = this.username;
    this.clearMessages();
  }

  cancelEditUsername(): void {
    this.editingUsername = false;
    this.newUsername = '';
  }

  saveUsername(): void {
    if (!this.newUsername.trim()) {
      this.errorMessage = 'Username cannot be empty';
      return;
    }
    if (this.newUsername === this.username) {
      this.editingUsername = false;
      return;
    }
    this.isLoading = true;
    this.clearMessages();
    this.authService.updateProfile(this.userId, this.newUsername, this.email).subscribe({
      next: (response) => {
        this.username = response.user.username;
        this.editingUsername = false;
        this.isLoading = false;
        this.successMessage = 'Username updated successfully';
        this.autoClearSuccess();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update username';
      }
    });
  }

  startEditEmail(): void {
    this.editingEmail = true;
    this.newEmail = this.email;
    this.clearMessages();
  }

  cancelEditEmail(): void {
    this.editingEmail = false;
    this.newEmail = '';
  }

  saveEmail(): void {
    if (!this.newEmail.trim()) {
      this.errorMessage = 'Email cannot be empty';
      return;
    }
    if (this.newEmail === this.email) {
      this.editingEmail = false;
      return;
    }
    this.isLoading = true;
    this.clearMessages();
    this.authService.updateProfile(this.userId, this.username, this.newEmail).subscribe({
      next: (response) => {
        this.email = response.user.email;
        this.editingEmail = false;
        this.isLoading = false;
        this.successMessage = 'Email updated successfully';
        this.autoClearSuccess();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update email';
      }
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.clearMessages();
  }

  onChangePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'All password fields are required';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    this.isLoading = true;
    this.clearMessages();
    this.authService.changePassword(this.userId, this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully';
        this.showPasswordForm = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.autoClearSuccess();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to change password';
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private autoClearSuccess(): void {
    setTimeout(() => { this.successMessage = ''; }, 3000);
  }
}
