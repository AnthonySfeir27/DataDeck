import { Component, OnInit } from '@angular/core';
import { TagsService } from '../services/tags.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tags: any[] = [];
  showCreateModal: boolean = false;
  newTagName: string = '';

  constructor(
    private tagsService: TagsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.tagsService.getTags(user.id).subscribe({
        next: (response) => {
          this.tags = response.tags;
        },
        error: (error) => {
          console.error('Error loading tags:', error);
        }
      });
    }
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newTagName = '';
  }

  createTag(): void {
    if (!this.newTagName.trim()) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.tagsService.createTag({
      name: this.newTagName,
      user_id: user.id
    }).subscribe({
      next: (response) => {
        this.tags.push(response.tag);
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Error creating tag:', error);
        alert(error.error.message || 'Error creating tag');
      }
    });
  }

  deleteTag(tagId: string): void {
    if (confirm('Are you sure you want to delete this tag?')) {
      this.tagsService.deleteTag(tagId).subscribe({
        next: () => {
          this.tags = this.tags.filter(t => t.id !== tagId);
        },
        error: (error) => {
          console.error('Error deleting tag:', error);
        }
      });
    }
  }
}

