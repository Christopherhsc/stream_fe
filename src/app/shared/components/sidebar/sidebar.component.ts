import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { sidebarData } from './sidebar-data';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, MatIconModule],
})
export class SidebarComponent {
  @Output() collapsedChange = new EventEmitter<boolean>();
  expandedItems = new Set<any>();
  data = sidebarData;
  isCollapsed = false;

  constructor(private elementRef: ElementRef) {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  toggleSubMenu(item: any, submenuElement: HTMLElement): void {
    if (this.isExpanded(item)) {
      // Collapse submenu
      this.expandedItems.delete(item);
      submenuElement.style.maxHeight = `${submenuElement.scrollHeight}px`; // Set current height
      setTimeout(() => {
        submenuElement.style.maxHeight = '0'; // Collapse smoothly
        submenuElement.classList.remove('expanded'); // Remove expanded class
      }, 0);
    } else {
      // Expand submenu
      this.expandedItems.add(item);
      submenuElement.style.maxHeight = '0'; // Start from collapsed state
      submenuElement.classList.add('expanded'); // Add expanded class
      setTimeout(() => {
        submenuElement.style.maxHeight = `${submenuElement.scrollHeight}px`; // Expand smoothly
      }, 0);
    }
  }
  

  isExpanded(item: any): boolean {
    return this.expandedItems.has(item);
  }
}
