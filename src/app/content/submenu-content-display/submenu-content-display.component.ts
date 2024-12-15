import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { componentData } from '../../shared/data/component-data';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from "../components/header/header.component";
import { StreamsComponent } from "../components/streams/streams.component";

@Component({
  selector: 'app-submenu-content-display',
  templateUrl: './submenu-content-display.component.html',
  styleUrls: ['./submenu-content-display.component.scss'],

  imports: [CommonModule, MatIconModule, HeaderComponent, StreamsComponent]
})
export class SubmenuContentDisplayComponent implements OnInit {
  // State for HeaderComponent
  headerData: { headerImage: string; title: string; viewers: number | null } | null = null;

  // State for StreamsComponent
  streamsData: any = null;

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
    const matchedItem = componentData.flatMap((item) => item.subMenu || [])
      .find((subItem) => subItem.url === url);

    if (matchedItem) {
      this.headerData = {
        headerImage: matchedItem.headerImage || '/assets/fallback.jpg',
        title: matchedItem.title || 'Default Title',
        viewers: matchedItem.viewers || null,
      };
      this.streamsData = matchedItem; // Pass the entire matched object for StreamsComponent
    } else {
      this.headerData = {
        headerImage: '/assets/fallback.jpg',
        title: 'Welcome to Streamers World',
        viewers: null,
      };
      this.streamsData = null;
    }
  }
}
