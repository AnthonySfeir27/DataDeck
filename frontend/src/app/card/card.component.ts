import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit, OnChanges {
  @Input() card: any;
  @Output() cardClick = new EventEmitter<any>();
  @Output() imageClick = new EventEmitter<string>();

  imageSource: string = '';

  ngOnInit(): void {
    this.updateImageSource();
  }

  ngOnChanges(): void {
    this.updateImageSource();
  }

  updateImageSource(): void {
    if (this.card) {
      if (this.card.image_data) {
        this.imageSource = this.card.image_data;
      } else {
        this.imageSource = this.card.image_url || '';
      }
    }
  }

  onCardClick(): void {
    this.cardClick.emit(this.card);
  }

  onImageClick(event: Event): void {
    event.stopPropagation();
    if (this.imageSource) {
      this.imageClick.emit(this.imageSource);
    }
  }

  getStars(rating: number): string {
    const full = Math.round(rating || 0);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  getBookPercent(card: any): number {
    const current = card.master_tag_data?.current_page || 0;
    const total = card.master_tag_data?.pages || 0;
    if (!total) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  }

  getSeriesPercent(card: any): number {
    if (!card.master_tag_data?.watched_episodes) return 0;
    let total = 0;
    let watched = 0;
    card.master_tag_data.watched_episodes.forEach((season: any) => {
      total += season.episodes.length;
      watched += season.episodes.filter((e: boolean) => e).length;
    });
    if (!total) return 0;
    return Math.round((watched / total) * 100);
  }

  getSeriesProgress(card: any): string {
    if (!card.master_tag_data?.watched_episodes) return '0 episodes';
    let total = 0;
    let watched = 0;
    card.master_tag_data.watched_episodes.forEach((season: any) => {
      total += season.episodes.length;
      watched += season.episodes.filter((e: boolean) => e).length;
    });
    return `${watched}/${total} eps`;
  }
}
