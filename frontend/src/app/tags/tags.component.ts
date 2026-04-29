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
  filteredTags: any[] = [];
  showCreateModal: boolean = false;
  newTagName: string = '';
  searchQuery: string = '';

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
          this.applySearch();
        },
        error: (error) => {
          console.error('Error loading tags:', error);
        }
      });
    }
  }

  applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTags = [...this.tags];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredTags = this.tags.filter(tag => 
        tag.name.toLowerCase().includes(query)
      );
    }
  }

  onSearchChange(): void {
    this.applySearch();
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
        this.applySearch();
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
          this.applySearch();
        },
        error: (error) => {
          console.error('Error deleting tag:', error);
        }
      });
    }
  }
}


