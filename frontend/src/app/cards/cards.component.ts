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
  filteredCards: any[] = [];
  availableTags: any[] = [];
  filteredTagsForDisplay: any[] = [];
  filteredTagsForSelector: any[] = [];
  masterTags = [
    { id: 'note', name: 'Note', icon: '📝' },
    { id: 'task', name: 'Task', icon: '✅' }
  ];
  showCreateModal: boolean = false;
  showViewModal: boolean = false;
  showEditModal: boolean = false;
  showTagSelectorModal: boolean = false;
  showImageViewerModal: boolean = false;
  showTagFilterSearch: boolean = false;
  selectedCard: any = null;
  selectedImage: string = '';
  imageUploadMethod: string = 'url';
  editImageUploadMethod: string = 'url';
  isEditingCard: boolean = false;
  searchQuery: string = '';
  searchFilter: string = 'all';
  selectedFilterTags: string[] = [];
  tagFilterSearchQuery: string = '';
  tagSearchQuery: string = '';
  tempSelectedTags: string[] = [];
  newCard = {
    title: '',
    description: '',
    image_url: '',
    image_data: '',
    tags: [] as string[],
    master_tag: '',
    urls: [] as string[],
    master_tag_data: {} as any
  };
  editCard = {
    id: '',
    title: '',
    description: '',
    image_url: '',
    image_data: '',
    tags: [] as string[],
    master_tag: '',
    urls: [] as string[],
    master_tag_data: {} as any
  };

  constructor(
    private cardsService: CardsService,
    private authService: AuthService,
    private tagsService: TagsService
  ) {}

  ngOnInit(): void {
    console.log('[Cards] Component initializing...');
    this.loadCards();
    this.loadTags();
    console.log('[Cards] Component initialized');
  }

  loadCards(): void {
    console.log('[Cards] Loading cards...');
    const user = this.authService.getCurrentUser();
    if (user) {
      console.log('[Cards] User found:', user.id);
      this.cardsService.getCards(user.id).subscribe({
        next: (response) => {
          console.log('[Cards] Cards loaded:', response.cards.length);
          this.cards = response.cards;
          this.applyFilters();
        },
        error: (error) => {
          console.error('[Cards] Error loading cards:', error);
        }
      });
    } else {
      console.log('[Cards] No user found');
    }
  }

  loadTags(): void {
    console.log('[Cards] Loading tags...');
    const user = this.authService.getCurrentUser();
    if (user) {
      console.log('[Cards] User found for tags:', user.id);
      this.tagsService.getTags(user.id).subscribe({
        next: (response) => {
          console.log('[Cards] Tags loaded:', response.tags.length);
          this.availableTags = response.tags;
          this.filteredTagsForDisplay = [...this.availableTags];
          console.log('[Cards] filteredTagsForDisplay set:', this.filteredTagsForDisplay.length);
        },
        error: (error) => {
          console.error('[Cards] Error loading tags:', error);
        }
      });
    } else {
      console.log('[Cards] No user found for tags');
    }
  }

  updateFilteredTagsForDisplay(): void {
    console.log('[Cards] Updating filtered tags for display, query:', this.tagFilterSearchQuery);
    if (!this.tagFilterSearchQuery.trim()) {
      this.filteredTagsForDisplay = [...this.availableTags];
    } else {
      const query = this.tagFilterSearchQuery.toLowerCase();
      this.filteredTagsForDisplay = this.availableTags.filter(tag => 
        tag.name.toLowerCase().includes(query)
      );
    }
    console.log('[Cards] Filtered tags for display:', this.filteredTagsForDisplay.length);
  }

  toggleTagFilterSearch(): void {
    console.log('[Cards] Toggling tag filter search');
    this.showTagFilterSearch = !this.showTagFilterSearch;
    if (!this.showTagFilterSearch) {
      this.tagFilterSearchQuery = '';
      this.filteredTagsForDisplay = [...this.availableTags];
    }
    console.log('[Cards] Tag filter search visible:', this.showTagFilterSearch);
  }

  truncateTagName(name: string, maxLength: number = 20): string {
    if (!name) {
      console.warn('[Cards] truncateTagName called with empty name');
      return '';
    }
    if (name.length <= maxLength) {
      return name;
    }
    return name.substring(0, maxLength) + '...';
  }

  applyFilters(): void {
    console.log('[Cards] Applying filters...');
    let filtered = [...this.cards];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(card => {
        if (this.searchFilter === 'all') {
          return card.title.toLowerCase().includes(query) ||
                 card.description.toLowerCase().includes(query);
        } else if (this.searchFilter === 'title') {
          return card.title.toLowerCase().includes(query);
        } else if (this.searchFilter === 'description') {
          return card.description.toLowerCase().includes(query);
        }
        return true;
      });
    }

    // Apply tag filter
    if (this.selectedFilterTags.length > 0) {
      filtered = filtered.filter(card => {
        return this.selectedFilterTags.every(tag => card.tags.includes(tag));
      });
    }

    this.filteredCards = filtered;
    console.log('[Cards] Filtered cards:', this.filteredCards.length);
  }

  toggleFilterTag(tagName: string): void {
    const index = this.selectedFilterTags.indexOf(tagName);
    if (index > -1) {
      this.selectedFilterTags.splice(index, 1);
    } else {
      this.selectedFilterTags.push(tagName);
    }
    this.applyFilters();
  }

  isFilterTagSelected(tagName: string): boolean {
    return this.selectedFilterTags.includes(tagName);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  updateFilteredTagsForSelector(): void {
    console.log('[Cards] Updating filtered tags for selector, query:', this.tagSearchQuery);
    if (!this.tagSearchQuery.trim()) {
      this.filteredTagsForSelector = [...this.availableTags];
    } else {
      const query = this.tagSearchQuery.toLowerCase();
      this.filteredTagsForSelector = this.availableTags.filter(tag => 
        tag.name.toLowerCase().includes(query)
      );
    }
    console.log('[Cards] Filtered tags for selector:', this.filteredTagsForSelector.length);
  }

  onCardClick(card: any): void {
    this.selectedCard = card;
    this.showViewModal = true;
  }

  onImageClickFromCard(imageSource: string): void {
    this.selectedImage = imageSource;
    this.showImageViewerModal = true;
  }

  onImageClick(event: Event, imageSource: string): void {
    event.stopPropagation();
    this.selectedImage = imageSource;
    this.showImageViewerModal = true;
  }

  closeImageViewer(): void {
    this.showImageViewerModal = false;
    this.selectedImage = '';
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.imageUploadMethod = 'url';
    this.newCard.master_tag = 'note';
    this.initializeMasterTagData(this.newCard);
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newCard = {
      title: '',
      description: '',
      image_url: '',
      image_data: '',
      tags: [],
      master_tag: '',
      urls: [],
      master_tag_data: {}
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
      tags: [...(this.selectedCard.tags || [])],
      master_tag: this.selectedCard.master_tag || 'note',
      urls: [...(this.selectedCard.urls || [])],
      master_tag_data: JSON.parse(JSON.stringify(this.selectedCard.master_tag_data || {}))
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
      master_tag: '',
      urls: [],
      master_tag_data: {}
    };
    this.editImageUploadMethod = 'url';
  }

  openTagSelector(isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    this.tempSelectedTags = isEdit ? [...this.editCard.tags] : [...this.newCard.tags];
    this.tagSearchQuery = '';
    this.filteredTagsForSelector = [...this.availableTags];
    this.showTagSelectorModal = true;
  }

  closeTagSelector(): void {
    this.showTagSelectorModal = false;
    this.tagSearchQuery = '';
    this.tempSelectedTags = [];
    this.filteredTagsForSelector = [];
  }

  toggleTagInSelector(tagName: string): void {
    const index = this.tempSelectedTags.indexOf(tagName);
    if (index > -1) {
      this.tempSelectedTags.splice(index, 1);
    } else {
      this.tempSelectedTags.push(tagName);
    }
  }

  isTagSelectedInSelector(tagName: string): boolean {
    return this.tempSelectedTags.includes(tagName);
  }

  applyTagSelection(): void {
    if (this.isEditingCard) {
      this.editCard.tags = [...this.tempSelectedTags];
    } else {
      this.newCard.tags = [...this.tempSelectedTags];
    }
    this.closeTagSelector();
  }

  removeTag(tagName: string, isEdit: boolean = false): void {
    if (isEdit) {
      const index = this.editCard.tags.indexOf(tagName);
      if (index > -1) {
        this.editCard.tags.splice(index, 1);
      }
    } else {
      const index = this.newCard.tags.indexOf(tagName);
      if (index > -1) {
        this.newCard.tags.splice(index, 1);
      }
    }
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

  initializeMasterTagData(card: any): void {
    if (card.master_tag === 'task') {
      card.master_tag_data = {
        deadline: '',
        completed: false
      };
    } else {
      card.master_tag_data = {};
    }
  }

  onMasterTagChange(card: any): void {
    this.initializeMasterTagData(card);
  }

  createCard(): void {
    if (!this.newCard.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!this.newCard.master_tag) {
      alert('Please select a card type');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const cardData: any = {
      title: this.newCard.title,
      description: this.newCard.description,
      tags: this.newCard.tags,
      master_tag: this.newCard.master_tag,
      urls: this.newCard.urls,
      master_tag_data: this.newCard.master_tag_data,
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
        this.applyFilters();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('[Cards] Error creating card:', error);
        alert('Error creating card');
      }
    });
  }

  updateCard(): void {
    if (!this.editCard.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!this.editCard.master_tag) {
      alert('Please select a card type');
      return;
    }

    const updateData: any = {
      title: this.editCard.title,
      description: this.editCard.description,
      tags: this.editCard.tags,
      master_tag: this.editCard.master_tag,
      urls: this.editCard.urls,
      master_tag_data: this.editCard.master_tag_data
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
        this.applyFilters();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('[Cards] Error updating card:', error);
        alert('Error updating card');
      }
    });
  }

  deleteCard(): void {
    if (!this.selectedCard) return;

    if (confirm('Are you sure you want to delete this card?')) {
      this.cardsService.deleteCard(this.selectedCard.id).subscribe({
        next: () => {
          this.cards = this.cards.filter(c => c.id !== this.selectedCard.id);
          this.applyFilters();
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





