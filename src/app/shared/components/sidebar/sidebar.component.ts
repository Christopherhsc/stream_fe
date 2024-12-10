import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { sidebarData } from './sidebar-data';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],

  imports: [CommonModule],
})
export class SidebarComponent {
  @Output() collapsedChange = new EventEmitter<boolean>();
  data = sidebarData;
  isCollapsed = false;

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }
}
