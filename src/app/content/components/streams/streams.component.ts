import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-streams',
  imports: [CommonModule, MatIconModule],
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamsComponent {
  @Input() backgroundColor: string = 'rgb(44, 44, 44)';
  @Input() filteredStreamers: Array<{
    name: string;
    viewers: number;
    embedUrl: SafeResourceUrl; // Update type to match sanitized URLs
  }> = [];
  @Input() isLoading: boolean = true;
  @Output() totalViewers = new EventEmitter<number>();
  currentSort: 'viewers' | null = null;

  trackByName(index: number, streamer: { name: string }): string {
    return streamer.name
  }
}
