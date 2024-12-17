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
import { HttpClient } from '@angular/common/http';
import { interval, Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-streams',
  imports: [CommonModule],
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamsComponent implements OnInit {
  @Input() backgroundColor: string = 'rgb(44, 44, 44)';
  @Input() streamers: Array<{ name: string; image: string }> = [];
  @Output() totalViewers = new EventEmitter<number>();

  filteredStreamers: Array<{
    name: string;
    image: string;
    viewers: number;
    embedUrl: SafeResourceUrl;
  }> = [];

  private clientId = 'wae0y5dpmnbmqbckcvo5ewaye7ucrt';
  private accessToken = 'm8ykf6oyyxsgtdngo6o3htnwggbn74';
  private pollingSubscription: Subscription | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize filteredStreamers with embed URLs
    this.filteredStreamers = this.streamers.map((streamer) => ({
      ...streamer,
      viewers: 0, // Default viewers to 0
      embedUrl: this.getTwitchEmbedUrl(streamer.name),
    }));

    this.fetchViewerCounts().subscribe();
    this.startPolling();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['streamers']?.currentValue) {
      this.filteredStreamers = this.streamers.map((streamer) => ({
        ...streamer,
        viewers: 0,
        embedUrl: this.getTwitchEmbedUrl(streamer.name),
      }));
      this.fetchViewerCounts().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  startPolling(): void {
    this.pollingSubscription = interval(10000)
      .pipe(switchMap(() => this.fetchViewerCounts()))
      .subscribe();
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  fetchViewerCounts(): Observable<any> {
    if (!this.streamers?.length) return of(null);

    const streamerNames = this.streamers
      .map((s) => s.name.trim())
      .filter(Boolean)
      .join('&user_login=');

    const url = `https://api.twitch.tv/helix/streams?user_login=${streamerNames}`;

    return this.http
      .get<any>(url, {
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      .pipe(
        switchMap((response) => {
          const liveStreams = response?.data || [];

          // Update viewer counts only
          this.filteredStreamers.forEach((streamer) => {
            const liveStream = liveStreams.find(
              (s: any) =>
                s.user_name.trim().toLowerCase() === streamer.name.trim().toLowerCase() &&
                s.game_name.toLowerCase() === 'world of warcraft' &&
                s.type === 'live'
            );
            streamer.viewers = liveStream ? liveStream.viewer_count : 0;
          });

          const totalViewers = this.filteredStreamers.reduce(
            (sum, streamer) => sum + (streamer.viewers || 0),
            0
          );
          this.totalViewers.emit(totalViewers);
          this.cdr.markForCheck();

          return of(response);
        })
      );
  }

  getTwitchEmbedUrl(channelName: string): SafeResourceUrl {
    const domain = window.location.hostname;
    const embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${domain}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  sortByViewers(): void {
    this.filteredStreamers = [...this.filteredStreamers].sort(
      (a, b) => b.viewers - a.viewers
    );
  }

  trackByName(index: number, streamer: { name: string }): string {
    return streamer.name;
  }
}
