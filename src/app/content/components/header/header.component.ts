import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import ColorThief from 'colorthief';
import { ViewerService } from '../../../shared/services/viewer.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],

  imports: [CommonModule, MatIconModule],
  animations: [
    trigger('countChange', [
      transition(':increment', [
        style({ transform: 'scale(1.2)', opacity: 0.8 }),
        animate('0.3s ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':decrement', [
        style({ transform: 'scale(0.8)', opacity: 0.8 }),
        animate('0.3s ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() headerData: {
    headerImage: string;
    title: string;
    viewers: number | null;
  } | null = null;

  @Output() dominantColor = new EventEmitter<string>();
  localDominantColor: string = 'rgba(0, 0, 0, 1)';
  onlineStreamersCount: number = 0

  constructor(private viewerService: ViewerService) {}

  ngOnInit(): void {
    // Subscribe to viewers$ to get the online streamers count
    this.viewerService.viewers$.subscribe((viewerData) => {
      this.onlineStreamersCount = Object.keys(viewerData).length;
    });

    // Update the dominant color
    if (this.headerData?.headerImage) {
      this.updateDominantColor();
    }
  }

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
      const rgba = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`; // Alpha value is 1 (fully opaque)

      this.dominantColor.emit(rgb); // Emit for external components
      this.localDominantColor = rgba; // Store locally for gradient
    };
  }
}
