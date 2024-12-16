import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import ColorThief from 'colorthief';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],

  imports: [CommonModule, MatIconModule]
})
export class HeaderComponent implements OnChanges {
  @Input() headerData: {
    headerImage: string;
    title: string;
    viewers: number | null;
  } | null = null;

  @Output() dominantColor = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['headerData'] && this.headerData?.headerImage) {
      this.updateDominantColor();
    }
  }

  private updateDominantColor(): void {
    const image = new Image();
    image.crossOrigin = 'Anonymous'; // Required for cross-origin images
    image.src = this.headerData?.headerImage || '/assets/fallback.jpg';

    image.onload = () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(image); // Returns [R, G, B]
      const rgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      this.dominantColor.emit(rgb); // Emit the RGB color string
    };
  }
}
