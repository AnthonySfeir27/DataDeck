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
  masterTags = [
    { id: 'note' },
    { id: 'task' }
  ];

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

  getSeriesProgress(card: any): string {
    if (!card.master_tag_data?.watched_episodes) {
      return '0 episodes watched';
    }
    
    let totalEpisodes = 0;
    let watchedEpisodes = 0;
    
    card.master_tag_data.watched_episodes.forEach((season: any) => {
      totalEpisodes += season.episodes.length;
      watchedEpisodes += season.episodes.filter((e: boolean) => e).length;
    });
    
    return `${watchedEpisodes}/${totalEpisodes} episodes`;
  }
}
