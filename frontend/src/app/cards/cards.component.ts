import { Component, OnInit } from '@angular/core';
import { CardsService } from '../services/cards.service';
import { AuthService } from '../services/auth.service';
import { TagsService } from '../services/tags.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {
  cards: any[] = [];
  availableTags: any[] = [];
  showCreateModal: boolean = false;
  showViewModal: boolean = false;
  showEditModal: boolean = false;
  selectedCard: any = null;
  imageUploadMethod: string = 'url';
  editImageUploadMethod: string = 'url';
  newCard = {
    title: '',
    description: '',
    image_url: '',
    image_data: '',
    tags: [] as string[],
    master_tag: null
  };
  editCard = {
    id: '',
    title: '',
    description: '',
    image_url: '',
    image_data: '',
    tags: [] as string[],
    master_tag: null
  };

  constructor(
    private cardsService: CardsService,
    private authService: AuthService,
    private tagsService: TagsService
  ) {}

  ngOnInit(): void {
    this.loadCards();
    this.loadTags();
  }

  loadCards(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.cardsService.getCards(user.id).subscribe({
        next: (response) => {
          this.cards = response.cards;
        },
        error: (error) => {
          console.error('Error loading cards:', error);
        }
      });
    }
  }

  loadTags(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.tagsService.getTags(user.id).subscribe({
        next: (response) => {
          this.availableTags = response.tags;
        },
        error: (error) => {
          console.error('Error loading tags:', error);
        }
      });
    }
  }

  onCardClick(card: any): void {
    this.selectedCard = card;
    this.showViewModal = true;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.imageUploadMethod = 'url';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newCard = {
      title: '',
      description: '',
      image_url: '',
      image_data: '',
      tags: [],
      master_tag: null
    };
    this.imageUploadMethod = 'url';
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedCard = null;
  }

  openEditModal(): void {
    this.editCard = {
      id: this.selectedCard.id,
      title: this.selectedCard.title,
      description: this.selectedCard.description,
      image_url: this.selectedCard.image_url || '',
      image_data: this.selectedCard.image_data || '',
      tags: this.selectedCard.tags || [],
      master_tag: this.selectedCard.master_tag
    };
    this.editImageUploadMethod = this.selectedCard.image_data ? 'file' : 'url';
    this.showViewModal = false;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editCard = {
      id: '',
      title: '',
      description: '',
      image_url: '',
      image_data: '',
      tags: [],
      master_tag: null
    };
    this.editImageUploadMethod = 'url';
  }

  onFileSelected(event: any, isEdit: boolean = false): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isEdit) {
          this.editCard.image_data = e.target.result;
          this.editCard.image_url = '';
        } else {
          this.newCard.image_data = e.target.result;
          this.newCard.image_url = '';
        }
      };
      reader.readAsDataURL(file);
    }
  }

  toggleTag(tagName: string, isEdit: boolean = false): void {
    if (isEdit) {
      const index = this.editCard.tags.indexOf(tagName);
      if (index > -1) {
        this.editCard.tags.splice(index, 1);
      } else {
        this.editCard.tags.push(tagName);
      }
    } else {
      const index = this.newCard.tags.indexOf(tagName);
      if (index > -1) {
        this.newCard.tags.splice(index, 1);
      } else {
        this.newCard.tags.push(tagName);
      }
    }
  }

  isTagSelected(tagName: string, isEdit: boolean = false): boolean {
    if (isEdit) {
      return this.editCard.tags.includes(tagName);
    }
    return this.newCard.tags.includes(tagName);
  }

  createCard(): void {
    if (!this.newCard.title.trim()) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const cardData: any = {
      title: this.newCard.title,
      description: this.newCard.description,
      tags: this.newCard.tags,
      master_tag: this.newCard.master_tag,
      user_id: user.id
    };

    if (this.imageUploadMethod === 'url' && this.newCard.image_url) {
      cardData.image_url = this.newCard.image_url;
      cardData.image_data = '';
    } else if (this.imageUploadMethod === 'file' && this.newCard.image_data) {
      cardData.image_data = this.newCard.image_data;
      cardData.image_url = '';
    }

    this.cardsService.createCard(cardData).subscribe({
      next: (response) => {
        this.cards.push(response.card);
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Error creating card:', error);
      }
    });
  }

  updateCard(): void {
    if (!this.editCard.title.trim()) {
      return;
    }

    const updateData: any = {
      title: this.editCard.title,
      description: this.editCard.description,
      tags: this.editCard.tags,
      master_tag: this.editCard.master_tag
    };

    if (this.editImageUploadMethod === 'url') {
      updateData.image_url = this.editCard.image_url;
      updateData.image_data = '';
    } else {
      updateData.image_data = this.editCard.image_data;
      updateData.image_url = '';
    }

    this.cardsService.updateCard(this.editCard.id, updateData).subscribe({
      next: (response) => {
        const index = this.cards.findIndex(c => c.id === this.editCard.id);
        if (index !== -1) {
          this.cards[index] = { ...this.cards[index], ...response.card };
        }
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating card:', error);
      }
    });
  }

  deleteCard(): void {
    if (!this.selectedCard) return;

    if (confirm('Are you sure you want to delete this card?')) {
      this.cardsService.deleteCard(this.selectedCard.id).subscribe({
        next: () => {
          this.cards = this.cards.filter(c => c.id !== this.selectedCard.id);
          this.closeViewModal();
        },
        error: (error) => {
          console.error('Error deleting card:', error);
        }
      });
    }
  }

  getImageSource(card: any): string {
    if (card.image_data) {
      return card.image_data;
    }
    return card.image_url || '';
  }
}



