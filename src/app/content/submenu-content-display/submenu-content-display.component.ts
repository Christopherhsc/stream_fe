import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { sidebarData } from '../../shared/data/sidebar-data';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../components/header/header.component';
import { StreamsComponent } from '../components/streams/streams.component';
import { streamerData } from '../../shared/data/streamer-data';

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
  streamsData: Array<{ name: string; image: string; }> = [];
  backgroundColor: string = 'rgb(44, 44, 44)'; // Default background color

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.updateComponentData(url);
      });
  }

  updateComponentData(url: string): void {
    // Find matching submenu item in sidebarData
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

      // Find corresponding streamers based on the matched group title
      const matchedStreamers = streamerData.find(
        (data) => data.group === matchedItem.title
      );
      this.streamsData = matchedStreamers ? matchedStreamers.streamers : [];
    } else {
      // Fallback when no match is found
      this.headerData = {
        headerImage: '/assets/fallback.jpg',
        title: 'Welcome to Streamers World',
        viewers: null,
      };
      this.streamsData = [];
    }
  }

  onDominantColorChange(color: string): void {
    this.backgroundColor = color; // Update the background color dynamically
  }

  onTotalViewersUpdate(totalViewers: number): void {
    if (this.headerData) {
      this.headerData.viewers = totalViewers; // Update the viewers dynamically
    }
  }
}
