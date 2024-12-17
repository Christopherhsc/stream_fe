import { ChangeDetectionStrategy, Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-streams',
  imports: [CommonModule],
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamsComponent {
  @Input() backgroundColor: string = 'rgb(44, 44, 44)';
  @Input() streamers: Array<{ name: string; image: string; url: string }> = []; // Existing streamers
  @ViewChild('twitchIframe') twitchIframe!: ElementRef;

  filteredStreamers: Array<{ name: string; image: string; url: string }> = []; // Streamers to display
  newStreamers: Array<{ name: string; image: string; url: string }> = []; // New streamers to add dynamically

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['streamers']) {
      this.updateStreamers();
    }
  }

  /**
   * Adds a new streamer to the list.
   */
  addStreamer(newStreamer: { name: string; image: string; url: string }): void {
    this.newStreamers.push(newStreamer);
    this.updateStreamers();
  }

  /**
   * Updates the list of streamers to display by merging existing and new streamers.
   */
  private updateStreamers(): void {
    const existingStreamersSet = new Set(this.streamers.map((s) => s.name));
    this.filteredStreamers = [
      ...this.streamers,
      ...this.newStreamers.filter((s) => !existingStreamersSet.has(s.name)), // Avoid duplicates
    ];
  }

  getTwitchEmbedUrl(channelName: string): SafeResourceUrl {
    const domain = window.location.hostname; // Replace with your actual domain if needed
    const embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${domain}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  setTwitchStream(channelName: string): void {
    const domain = window.location.hostname; // Replace if needed
    const embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${domain}`;
    this.twitchIframe.nativeElement.src = embedUrl;
  }
}
