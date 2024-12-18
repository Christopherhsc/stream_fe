import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { sidebarData } from '../../shared/data/sidebar-data';
import { streamerData } from '../../shared/data/streamer-data';
import { ViewerService } from '../../shared/services/streamerData.service';
import { HeaderComponent } from '../components/header/header.component';
import { StreamsComponent } from '../components/streams/streams.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-submenu-content-display',
  templateUrl: './submenu-content-display.component.html',
  styleUrls: ['./submenu-content-display.component.scss'],
  imports: [CommonModule, MatIconModule, HeaderComponent, StreamsComponent],
})
export class SubmenuContentDisplayComponent implements OnInit {
  headerData: {
    headerImage: string;
    title: string;
    viewers: number | null;
  } | null = null;

  streamsData: Array<{ name: string }> = []; // Raw streamers data
  filteredStreamers: Array<{
    name: string;
    viewers: number;
    embedUrl: SafeResourceUrl;
  }> = [];
  isLoading = true; // Track loading state
  backgroundColor: string = 'rgb(44, 44, 44)'; // Default background color
  currentSort: 'viewers' | null = null;

  constructor(
    private router: Router,
    private viewerService: ViewerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.updateComponentData(url);
      });
  }

  updateComponentData(url: string): void {
    const matchedItem = sidebarData
      .flatMap((item) => item.subMenu || [])
      .find((subItem) => subItem.url === url);

    if (matchedItem) {
      // Set header data
      this.headerData = {
        headerImage: matchedItem.headerImage || '/assets/fallback.jpg',
        title: matchedItem.title || 'Default Title',
        viewers: matchedItem.viewers || null,
      };

      // Get streamers for the matched group
      const matchedStreamers = streamerData.find(
        (data) => data.group === matchedItem.title
      );
      this.streamsData = matchedStreamers ? matchedStreamers.streamers : [];

      // Fetch viewer counts for the group
      this.isLoading = true;
      this.viewerService.fetchViewerCounts(matchedItem.title);
      this.viewerService.viewers$.subscribe((viewerData) => {
        this.updateFilteredStreamers(viewerData);

        // Calculate total viewers
        const totalViewers = this.filteredStreamers.reduce(
          (sum, streamer) => sum + streamer.viewers,
          0
        );
        if (this.headerData) this.headerData.viewers = totalViewers;

        this.isLoading = false;
      });
    } else {
      // Fallback when no matching URL
      this.headerData = {
        headerImage: '/assets/fallback.jpg',
        title: 'Welcome to Streamers World',
        viewers: null,
      };
      this.streamsData = [];
      this.filteredStreamers = [];
      this.viewerService.stopPolling();
    }
  }

  updateFilteredStreamers(viewerData: Record<string, any>): void {
    const existingStreamerMap = new Map(
      this.filteredStreamers.map((streamer) => [streamer.name, streamer]) 
    );
  
    // Update viewer counts for existing streamers
    this.filteredStreamers.forEach((streamer) => {
      const liveData = viewerData[streamer.name];
      if (liveData) {
        streamer.viewers = liveData.viewer_count; // Update viewer count
      } else {
        streamer.viewers = 0; // Mark streamer as offline
      }
    });
  
    // Remove offline streamers
    this.filteredStreamers = this.filteredStreamers.filter(
      (streamer) => streamer.viewers > 0
    );
  
    // Add new streamers from the fetched data
    const newStreamers = Object.entries(viewerData)
      .filter(([key]) => !existingStreamerMap.has(key)) 
      .map(([key, liveData]: [string, any]) => ({
        name: key,
        viewers: liveData.viewer_count,
        thumbnail_url: liveData.thumbnail_url,
        title: liveData.title,
        embedUrl: this.getTwitchEmbedUrl(key),
      }));
  
    this.filteredStreamers.push(...newStreamers);
  
    // Reapply the current sort if necessary
    if (this.currentSort === 'viewers') {
      this.filteredStreamers.sort((a, b) => b.viewers - a.viewers);
    }
  }  

  getTwitchEmbedUrl(channelName: string): SafeResourceUrl {
    const domain = window.location.hostname;
    const embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${domain}&muted=true`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  onDominantColorChange(color: string): void {
    this.backgroundColor = color; // Update the background color dynamically
  }

  onTotalViewersUpdate(totalViewers: number): void {
    if (this.headerData) {
      this.headerData.viewers = totalViewers; // Update viewers dynamically
    }
  }
}
