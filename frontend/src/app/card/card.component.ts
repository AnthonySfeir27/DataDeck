import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() card: any;
  @Output() cardClick = new EventEmitter<any>();

  onCardClick(): void {
    this.cardClick.emit(this.card);
  }

  getImageSource(): string {
    if (this.card.image_data) {
      return this.card.image_data;
    }
    return this.card.image_url || '';
  }
}
