import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ViewerService } from '../../../shared/services/viewer.service';

@Component({
  selector: 'app-streams',
  imports: [CommonModule],
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamsComponent implements OnInit {
  @Input() backgroundColor: string = 'rgb(44, 44, 44)';
  @Input() streamers: Array<{ name: string }> = [];
  @Output() totalViewers = new EventEmitter<number>();

  filteredStreamers: Array<{
    name: string;
    viewers: number;
    embedUrl: SafeResourceUrl; // Embed URL remains fixed
  }> = [];

  constructor(
    private sanitizer: DomSanitizer,
    private viewerService: ViewerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize `filteredStreamers` with default data
    this.filteredStreamers = this.streamers.map((streamer) => ({
      ...streamer,
      viewers: 0,
      embedUrl: this.getTwitchEmbedUrl(streamer.name),
    }));

    // Subscribe to viewer data updates
    this.viewerService.fetchViewerCounts();
    this.viewerService.viewers$.subscribe((viewerData) => {
      // Update existing `filteredStreamers` in-place
      this.filteredStreamers.forEach((streamer) => {
        const liveData = viewerData[streamer.name.toLowerCase()];
        if (liveData) {
          streamer.viewers = liveData.viewer_count; // Update viewer count
        } else {
          streamer.viewers = 0; // Mark offline
        }
      });

      // Remove offline streamers in place
      this.filteredStreamers = this.filteredStreamers.filter(
        (streamer) => streamer.viewers > 0
      );

      // Calculate and emit total viewers
      const totalViewers = this.filteredStreamers.reduce(
        (sum, streamer) => sum + streamer.viewers,
        0
      );
      this.totalViewers.emit(totalViewers);

      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['streamers']?.currentValue) {
      // Initialize filteredStreamers with embed URLs
      this.filteredStreamers = this.streamers.map((streamer) => ({
        ...streamer,
        viewers: 0,
        embedUrl: this.getTwitchEmbedUrl(streamer.name), // Generate embed URL once
      }));

      console.log('FILTERED STREAMERS (ON CHANGE)', this.filteredStreamers);

      // Fetch viewer counts after initialization
      this.viewerService.fetchViewerCounts();
    }
  }

  getTwitchEmbedUrl(channelName: string): SafeResourceUrl {
    const domain = window.location.hostname;
    const embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${domain}&muted=true`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  sortByViewers(): void {
    this.filteredStreamers = [...this.filteredStreamers].sort(
      (a, b) => b.viewers - a.viewers
    );
  }

  trackByName(index: number, streamer: { name: string }): string {
    return streamer.name; // Prevent unnecessary DOM re-renders
  }
}
