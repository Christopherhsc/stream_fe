import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { sidebarData } from '../../data/sidebar-data';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, MatIconModule, RouterModule],

  animations: [
    trigger('titleAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('2s ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('0.1s ease-in', style({ opacity: 0, transform: 'scale(0.8)' })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  @Output() collapsedChange = new EventEmitter<boolean>();
  expandedItems = new Set<any>();
  data = sidebarData;
  isCollapsed = false;

  constructor(private elementRef: ElementRef, private viewerService: ViewerService) {}

  ngOnInit(): void {
    const allStreamers = this.getAllStreamers();
    this.viewerService.fetchViewerCounts(allStreamers);

    // Subscribe to viewer counts
    this.viewerService.viewers$.subscribe((viewerCounts) => {
      this.updateViewerCounts(viewerCounts);
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());

    // Recalculate submenu heights for all expanded items
    setTimeout(() => {
      this.expandedItems.forEach((item) => {
        const submenuElement = this.elementRef.nativeElement.querySelector(
          `.menu li:nth-child(${this.data.indexOf(item) + 1}) .sub-menu`
        );
        if (submenuElement) {
          submenuElement.style.maxHeight = `${submenuElement.scrollHeight}px`;
        }
      });
    }, 0);
  }

  toggleSubMenu(item: any): void {
    const submenuElement = this.elementRef.nativeElement.querySelector(
      `.menu li:nth-child(${this.data.indexOf(item) + 1}) .sub-menu`
    );

    if (!submenuElement) return;

    if (this.isExpanded(item)) {
      // Collapse submenu
      this.expandedItems.delete(item);
      submenuElement.style.maxHeight = `${submenuElement.scrollHeight}px`;
      setTimeout(() => (submenuElement.style.maxHeight = '0'), 0);
    } else {
      // Expand submenu
      this.expandedItems.add(item);
      submenuElement.style.maxHeight = '0';
      setTimeout(() => {
        submenuElement.style.maxHeight = `${submenuElement.scrollHeight}px`;
      }, 0);
    }
  }

  isExpanded(item: any): boolean {
    return this.expandedItems.has(item);
  }

  private getAllStreamers(): string[] {
    // Collect all streamer names from submenus
    return this.data.flatMap((item) =>
      item.subMenu?.flatMap((subItem) => subItem.title) || []
    );
  }
  private updateViewerCounts(viewerCounts: Record<string, number>): void {
    this.data.forEach((item) => {
      let totalViewers = 0;
  
      // Update subMenu viewer counts and aggregate to parent
      item.subMenu?.forEach((subItem) => {
        const titleKey = subItem.title.trim().toLowerCase(); // Normalize title
        const count = viewerCounts[titleKey] || 0; // Fetch viewer count
        subItem.viewers = count;
        totalViewers += count;
      });
  
      item.viewers = totalViewers; // Update total viewers for parent item
    });
  
    console.log('Updated Viewer Counts:', this.data);
  }
  
}
