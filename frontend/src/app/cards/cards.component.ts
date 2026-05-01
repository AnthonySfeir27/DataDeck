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
    { id: 'task', name: 'Task', icon: '✅' },
    { id: 'movie', name: 'Movie', icon: '🎬' },
    { id: 'tv_series', name: 'TV Series', icon: '📺' },
    { id: 'book', name: 'Book', icon: '📚' }
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
    image_urls: [] as string[],
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
    image_urls: [] as string[],
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
      image_urls: [],
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
      image_urls: [...(this.selectedCard.image_urls || [])],
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
      image_urls: [],
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
    const files = event.target.files;
    if (files && files.length > 0) {
      // First file goes to image_data (main image)
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
      reader.readAsDataURL(files[0]);

      // Additional files go to image_urls array as base64
      if (files.length > 1) {
        for (let i = 1; i < files.length; i++) {
          const additionalReader = new FileReader();
          additionalReader.onload = (e: any) => {
            if (isEdit) {
              if (!this.editCard.image_urls) {
                this.editCard.image_urls = [];
              }
              this.editCard.image_urls.push(e.target.result);
            } else {
              if (!this.newCard.image_urls) {
                this.newCard.image_urls = [];
              }
              this.newCard.image_urls.push(e.target.result);
            }
          };
          additionalReader.readAsDataURL(files[i]);
        }
      }
    }
  }

  initializeMasterTagData(card: any): void {
    if (card.master_tag === 'task') {
      card.master_tag_data = {
        deadline: '',
        completed: false
      };
    } else if (card.master_tag === 'movie') {
      card.master_tag_data = {
        watched: false,
        watch_date: '',
        movie_url: ''
      };
    } else if (card.master_tag === 'tv_series') {
      card.master_tag_data = {
        season_count: 1,
        episodes_per_season: [10], // Initialize with first season having 10 episodes
        series_url: '',
        watched_episodes: [{ episodes: Array(10).fill(false) }] // Initialize first season episodes
      };
    } else if (card.master_tag === 'book') {
      card.master_tag_data = {
        read: false,
        read_date: '',
        pages: 0,
        current_page: 0,
        rating: 0,
        book_url: ''
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
      image_urls: this.newCard.image_urls || [],
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
      image_urls: this.editCard.image_urls || [],
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

  getMasterTagName(masterTagId: string): string {
    const tag = this.masterTags.find(mt => mt.id === masterTagId);
    return tag ? `${tag.icon} ${tag.name}` : masterTagId;
  }

  onSeasonCountChange(card: any): void {
    const seasonCount = parseInt(card.master_tag_data.season_count) || 1;
    
    // Initialize episodes_per_season array
    if (!card.master_tag_data.episodes_per_season) {
      card.master_tag_data.episodes_per_season = [];
    }
    
    // Adjust array size to match season count
    while (card.master_tag_data.episodes_per_season.length < seasonCount) {
      card.master_tag_data.episodes_per_season.push(10); // Each new season defaults to 10 episodes (not copying from previous)
    }
    
    if (card.master_tag_data.episodes_per_season.length > seasonCount) {
      card.master_tag_data.episodes_per_season = card.master_tag_data.episodes_per_season.slice(0, seasonCount);
    }
    
    // Update watched episodes structure
    this.updateWatchedEpisodesStructure(card);
  }

  updateWatchedEpisodesStructure(card: any): void {
    if (!card.master_tag_data.watched_episodes) {
      card.master_tag_data.watched_episodes = [];
    }
    
    const newWatchedEpisodes: any[] = [];
    
    for (let s = 0; s < card.master_tag_data.episodes_per_season.length; s++) {
      const episodeCount = card.master_tag_data.episodes_per_season[s] || 0;
      const existingSeason = card.master_tag_data.watched_episodes[s] || { episodes: [] };
      
      const episodes: boolean[] = [];
      for (let e = 0; e < episodeCount; e++) {
        episodes.push(existingSeason.episodes[e] || false);
      }
      
      newWatchedEpisodes.push({ episodes });
    }
    
    card.master_tag_data.watched_episodes = newWatchedEpisodes;
  }

  toggleEpisode(card: any, seasonIndex: number, episodeIndex: number): void {
    if (card.master_tag_data.watched_episodes[seasonIndex]) {
      const current = card.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex];
      card.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex] = !current;
    }
  }

  getWatchedCount(episodes: boolean[]): number {
    if (!episodes) return 0;
    return episodes.filter(e => e).length;
  }

  toggleNewEpisode(seasonIndex: number, episodeIndex: number): void {
    this.newCard.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex] = 
      !this.newCard.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex];
  }

  toggleEditEpisode(seasonIndex: number, episodeIndex: number): void {
    this.editCard.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex] = 
      !this.editCard.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex];
  }

  toggleViewEpisode(seasonIndex: number, episodeIndex: number): void {
    this.selectedCard.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex] = 
      !this.selectedCard.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex];
    this.onTaskCompletionToggle();
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // URL Management
  addUrl(isEdit: boolean = false): void {
    if (isEdit) {
      if (!this.editCard.urls) {
        this.editCard.urls = [];
      }
      this.editCard.urls.push('');
    } else {
      if (!this.newCard.urls) {
        this.newCard.urls = [];
      }
      this.newCard.urls.push('');
    }
  }

  removeUrl(index: number, isEdit: boolean = false): void {
    if (isEdit) {
      this.editCard.urls.splice(index, 1);
    } else {
      this.newCard.urls.splice(index, 1);
    }
  }

  // Image Management
  addImageUrl(isEdit: boolean = false): void {
    if (isEdit) {
      if (!this.editCard.image_urls) {
        this.editCard.image_urls = [];
      }
      this.editCard.image_urls.push('');
    } else {
      if (!this.newCard.image_urls) {
        this.newCard.image_urls = [];
      }
      this.newCard.image_urls.push('');
    }
  }

  removeImageUrl(index: number, isEdit: boolean = false): void {
    if (isEdit) {
      this.editCard.image_urls.splice(index, 1);
    } else {
      this.newCard.image_urls.splice(index, 1);
    }
  }

  onTaskCompletionToggle(): void {
    if (!this.selectedCard) return;

    const updateData: any = {
      title: this.selectedCard.title,
      description: this.selectedCard.description,
      tags: this.selectedCard.tags,
      master_tag: this.selectedCard.master_tag,
      urls: this.selectedCard.urls || [],
      master_tag_data: this.selectedCard.master_tag_data,
      image_url: this.selectedCard.image_url || '',
      image_data: this.selectedCard.image_data || ''
    };

    this.cardsService.updateCard(this.selectedCard.id, updateData).subscribe({
      next: (response) => {
        const index = this.cards.findIndex(c => c.id === this.selectedCard.id);
        if (index !== -1) {
          this.cards[index] = { ...this.cards[index], ...response.card };
        }
        this.applyFilters();
        console.log('[Cards] Task completion toggled');
      },
      error: (error) => {
        console.error('[Cards] Error toggling task completion:', error);
        alert('Error updating task');
      }
    });
  }
}





