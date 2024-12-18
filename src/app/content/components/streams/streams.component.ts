import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-streams',
  imports: [CommonModule],
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

  sortByViewers(): void {
    this.filteredStreamers = [...this.filteredStreamers].sort(
      (a, b) => b.viewers - a.viewers
    );
  }

  trackByName(index: number, streamer: { name: string }): string {
    return streamer.name; // Use a unique property to track DOM updates
  }
}
