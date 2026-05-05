import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CardsService } from '../services/cards.service';
import { AuthService } from '../services/auth.service';
import { TagsService } from '../services/tags.service';
import { Card } from '../models/card.model';
import { createEmptyCard, createEditCardFromSource, buildCardPayload } from '../helpers/card-form.helper';

@Component({
  selector: 'app-card-dashboard',
  templateUrl: './card-dashboard.component.html',
  styleUrls: ['./card-dashboard.component.css']
})
export class CardDashboardComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────────────────
  cards: any[] = [];
  filteredCards: any[] = [];
  availableTags: any[] = [];
  filteredTagsForDisplay: any[] = [];
  filteredTagsForSelector: any[] = [];

  readonly SECTION_ORDER = ['note', 'task', 'movie', 'tv_series', 'book', 'game'];
  readonly SECTION_LABELS: any = {
    note: '📝 Notes', task: '✅ Tasks', movie: '🎬 Movies',
    tv_series: '📺 TV Series', book: '📚 Books', game: '🎮 Games'
  };
  masterTags = [
    { id: 'note', name: 'Note', icon: '📝' },
    { id: 'task', name: 'Task', icon: '✅' },
    { id: 'movie', name: 'Movie', icon: '🎬' },
    { id: 'tv_series', name: 'TV Series', icon: '📺' },
    { id: 'book', name: 'Book', icon: '📚' },
    { id: 'game', name: 'Game', icon: '🎮' }
  ];

  // ── Modal state ───────────────────────────────────────────────────────
  showCreateModal = false;
  showViewModal = false;
  showEditModal = false;
  showTagSelectorModal = false;
  showImageViewerModal = false;
  showDocumentViewerModal = false;
  showTagFilterSearch = false;

  selectedCard: any = null;
  selectedImage = '';
  selectedDocumentUrl: SafeResourceUrl = '';

  // ── Form state ────────────────────────────────────────────────────────
  imageUploadMethod = 'url';
  editImageUploadMethod = 'url';
  isEditingCard = false;
  searchQuery = '';
  searchFilter = 'all';
  selectedFilterTags: string[] = [];
  tagFilterSearchQuery = '';
  tagSearchQuery = '';
  tempSelectedTags: string[] = [];

  newCard: Card = createEmptyCard();
  editCard: Card & { id?: string } = createEmptyCard();

  // ── Computed ──────────────────────────────────────────────────────────
  get cardSections(): { label: string; type: string; cards: any[] }[] {
    return this.SECTION_ORDER
      .map(type => ({
        label: this.SECTION_LABELS[type],
        type,
        cards: this.filteredCards.filter(c => (c.master_tag || 'note') === type)
      }))
      .filter(s => s.cards.length > 0);
  }

  constructor(
    private cardsService: CardsService,
    private authService: AuthService,
    private tagsService: TagsService,
    private sanitizer: DomSanitizer
  ) {}

  // =====================================================================
  //  MAIN FUNCTIONS – Handle flow, validation, routing, error handling
  // =====================================================================

  ngOnInit(): void {
    this.loadCards();
    this.loadTags();
  }

  /** Loads all cards for the current user. */
  loadCards(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.cardsService.getCards(user.id).subscribe({
      next: (response) => {
        this.cards = response.cards;
        this.applyFilters();
      },
      error: (error) => console.error('Error loading cards:', error)
    });
  }

  /** Loads all tags for the current user. */
  loadTags(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.tagsService.getTags(user.id).subscribe({
      next: (response) => {
        this.availableTags = response.tags;
        this.filteredTagsForDisplay = [...this.availableTags];
      },
      error: (error) => console.error('Error loading tags:', error)
    });
  }

  /** Validates and submits a new card. */
  createCard(): void {
    if (!this.newCard.title.trim()) { alert('Title is required'); return; }
    if (!this.newCard.master_tag) { alert('Please select a card type'); return; }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const payload = buildCardPayload(this.newCard, this.imageUploadMethod);
    payload.user_id = user.id;

    this.cardsService.createCard(payload).subscribe({
      next: (response) => {
        this.cards.push(response.card);
        this.applyFilters();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Error creating card:', error);
        alert('Error creating card');
      }
    });
  }

  /** Validates and submits card updates. */
  updateCard(): void {
    if (!this.editCard.title.trim()) { alert('Title is required'); return; }
    if (!this.editCard.master_tag) { alert('Please select a card type'); return; }

    const payload = buildCardPayload(this.editCard, this.editImageUploadMethod);

    this.cardsService.updateCard(this.editCard.id!, payload).subscribe({
      next: (response) => {
        const index = this.cards.findIndex(c => c.id === this.editCard.id);
        if (index !== -1) {
          this.cards[index] = { ...this.cards[index], ...response.card };
        }
        this.applyFilters();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating card:', error);
        alert('Error updating card');
      }
    });
  }

  /** Confirms and deletes the currently selected card. */
  deleteCard(): void {
    if (!this.selectedCard) return;
    if (!confirm('Are you sure you want to delete this card?')) return;

    this.cardsService.deleteCard(this.selectedCard.id).subscribe({
      next: () => {
        this.cards = this.cards.filter(c => c.id !== this.selectedCard.id);
        this.applyFilters();
        this.closeViewModal();
      },
      error: (error) => console.error('Error deleting card:', error)
    });
  }

  /** Auto-saves completion status toggle on the view modal. */
  onTaskCompletionToggle(): void {
    if (!this.selectedCard) return;

    const payload = buildCardPayload(this.selectedCard, this.selectedCard.image_data ? 'file' : 'url');

    this.cardsService.updateCard(this.selectedCard.id, payload).subscribe({
      next: (response) => {
        const index = this.cards.findIndex(c => c.id === this.selectedCard.id);
        if (index !== -1) {
          this.cards[index] = { ...this.cards[index], ...response.card };
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error toggling task completion:', error);
        alert('Error updating task');
      }
    });
  }

  // =====================================================================
  //  MODAL MANAGEMENT
  // =====================================================================

  openCreateModal(): void {
    this.showCreateModal = true;
    this.imageUploadMethod = 'url';
    this.newCard.master_tag = 'note';
    this.initializeMasterTagData(this.newCard);
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newCard = createEmptyCard();
    this.imageUploadMethod = 'url';
  }

  onCardClick(card: any): void {
    this.selectedCard = card;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedCard = null;
  }

  openEditModal(): void {
    this.editCard = createEditCardFromSource(this.selectedCard);
    this.editImageUploadMethod = this.selectedCard.image_data ? 'file' : 'url';
    this.showViewModal = false;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editCard = createEmptyCard();
    this.editImageUploadMethod = 'url';
  }

  // =====================================================================
  //  HELPERS – Each serves exactly one purpose
  // =====================================================================

  // ── Active card accessor (eliminates isEdit branching) ────────────────
  /**
   * Returns whichever card form is currently active (new or edit).
   * All form-manipulation helpers below use this instead of isEdit params.
   */
  private getActiveCard(): Card {
    return this.isEditingCard ? this.editCard : this.newCard;
  }

  // ── Search & filter ──────────────────────────────────────────────────
  applyFilters(): void {
    let filtered = [...this.cards];

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

    if (this.selectedFilterTags.length > 0) {
      filtered = filtered.filter(card =>
        this.selectedFilterTags.every(tag => card.tags.includes(tag))
      );
    }

    this.filteredCards = filtered;
  }

  onSearchChange(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  toggleFilterTag(tagName: string): void {
    const index = this.selectedFilterTags.indexOf(tagName);
    if (index > -1) { this.selectedFilterTags.splice(index, 1); }
    else { this.selectedFilterTags.push(tagName); }
    this.applyFilters();
  }

  isFilterTagSelected(tagName: string): boolean {
    return this.selectedFilterTags.includes(tagName);
  }

  // ── Tag filter display ──────────────────────────────────────────────
  updateFilteredTagsForDisplay(): void {
    if (!this.tagFilterSearchQuery.trim()) {
      this.filteredTagsForDisplay = [...this.availableTags];
    } else {
      const query = this.tagFilterSearchQuery.toLowerCase();
      this.filteredTagsForDisplay = this.availableTags.filter(tag =>
        tag.name.toLowerCase().includes(query)
      );
    }
  }

  toggleTagFilterSearch(): void {
    this.showTagFilterSearch = !this.showTagFilterSearch;
    if (!this.showTagFilterSearch) {
      this.tagFilterSearchQuery = '';
      this.filteredTagsForDisplay = [...this.availableTags];
    }
  }

  truncateTagName(name: string, maxLength: number = 20): string {
    if (!name) return '';
    return name.length <= maxLength ? name : name.substring(0, maxLength) + '...';
  }

  // ── Tag selector modal ──────────────────────────────────────────────
  updateFilteredTagsForSelector(): void {
    if (!this.tagSearchQuery.trim()) {
      this.filteredTagsForSelector = [...this.availableTags];
    } else {
      const query = this.tagSearchQuery.toLowerCase();
      this.filteredTagsForSelector = this.availableTags.filter(tag =>
        tag.name.toLowerCase().includes(query)
      );
    }
  }

  openTagSelector(isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    this.tempSelectedTags = [...this.getActiveCard().tags];
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
    if (index > -1) { this.tempSelectedTags.splice(index, 1); }
    else { this.tempSelectedTags.push(tagName); }
  }

  isTagSelectedInSelector(tagName: string): boolean {
    return this.tempSelectedTags.includes(tagName);
  }

  applyTagSelection(): void {
    this.getActiveCard().tags = [...this.tempSelectedTags];
    this.closeTagSelector();
  }

  removeTag(tagName: string, isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    const card = this.getActiveCard();
    const index = card.tags.indexOf(tagName);
    if (index > -1) { card.tags.splice(index, 1); }
  }

  // ── Image handling ──────────────────────────────────────────────────
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

  getImageSource(card: any): string {
    return card.image_data || card.image_url || '';
  }

  onFileSelected(event: any, isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const card = this.getActiveCard();

    const reader = new FileReader();
    reader.onload = (e: any) => {
      card.image_data = e.target.result;
      card.image_url = '';
    };
    reader.readAsDataURL(files[0]);

    for (let i = 1; i < files.length; i++) {
      const additionalReader = new FileReader();
      additionalReader.onload = (e: any) => {
        if (!card.image_urls) card.image_urls = [];
        card.image_urls.push(e.target.result);
      };
      additionalReader.readAsDataURL(files[i]);
    }
  }

  addImageUrl(isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    const card = this.getActiveCard();
    if (!card.image_urls) card.image_urls = [];
    card.image_urls.push('');
  }

  removeImageUrl(index: number, isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    this.getActiveCard().image_urls.splice(index, 1);
  }

  // ── URL management ──────────────────────────────────────────────────
  addUrl(isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    const card = this.getActiveCard();
    if (!card.urls) card.urls = [];
    card.urls.push('');
  }

  removeUrl(index: number, isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    this.getActiveCard().urls.splice(index, 1);
  }

  ensureHttpProtocol(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
  }

  // ── Document (PDF) handling ─────────────────────────────────────────
  onDocumentSelected(event: any, isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const card = this.getActiveCard();
      const reader = new FileReader();
      reader.onload = (e: any) => {
        card.document_data = e.target.result;
        card.document_name = file.name;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a PDF file');
    }
  }

  removeDocument(isEdit: boolean = false): void {
    this.isEditingCard = isEdit;
    const card = this.getActiveCard();
    card.document_data = '';
    card.document_name = '';
  }

  openDocumentViewer(documentData: string): void {
    this.selectedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(documentData);
    this.showDocumentViewerModal = true;
  }

  closeDocumentViewer(): void {
    this.showDocumentViewerModal = false;
    this.selectedDocumentUrl = '';
  }

  // ── Master tag initialization ───────────────────────────────────────
  getMasterTagName(masterTagId: string): string {
    const tag = this.masterTags.find(mt => mt.id === masterTagId);
    return tag ? `${tag.icon} ${tag.name}` : masterTagId;
  }

  initializeMasterTagData(card: any): void {
    if (card.master_tag === 'task') {
      card.master_tag_data = { deadline: '', completed: false };
    } else if (card.master_tag === 'movie') {
      card.master_tag_data = { watched: false, watch_date: '', movie_url: '' };
    } else if (card.master_tag === 'tv_series') {
      card.master_tag_data = {
        season_count: 1,
        episodes_per_season: [10],
        series_url: '',
        watched_episodes: [{ episodes: Array(10).fill(false) }]
      };
    } else if (card.master_tag === 'book') {
      card.master_tag_data = { read: false, read_date: '', pages: 0, current_page: 0, rating: 0, book_url: '' };
    } else if (card.master_tag === 'game') {
      card.master_tag_data = { completed: false, completion_date: '', hours_played: 0, platform: '', rating: 0, game_url: '' };
    } else {
      card.master_tag_data = { completed: false };
    }
  }

  onMasterTagChange(card: any): void {
    this.initializeMasterTagData(card);
  }

  // ── TV Series episode tracking ──────────────────────────────────────
  onSeasonCountChange(card: any): void {
    const seasonCount = parseInt(card.master_tag_data.season_count) || 1;

    if (!card.master_tag_data.episodes_per_season) {
      card.master_tag_data.episodes_per_season = [];
    }

    while (card.master_tag_data.episodes_per_season.length < seasonCount) {
      card.master_tag_data.episodes_per_season.push(10);
    }

    if (card.master_tag_data.episodes_per_season.length > seasonCount) {
      card.master_tag_data.episodes_per_season = card.master_tag_data.episodes_per_season.slice(0, seasonCount);
    }

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
      card.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex] =
        !card.master_tag_data.watched_episodes[seasonIndex].episodes[episodeIndex];
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

  // ── Utilities ───────────────────────────────────────────────────────
  trackByIndex(index: number, item: any): number {
    return index;
  }
}
