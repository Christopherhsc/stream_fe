import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { Maincomponent } from './content/components/main.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, Maincomponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  isSidebarCollapsed = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // Load the sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.isSidebarCollapsed = savedState === 'true';

    if (this.sidebar) {
      this.sidebar.isCollapsed = this.isSidebarCollapsed;
    }

    // Mark Angular's change detection for recheck
    this.cdr.detectChanges();
  }

  onSidebarToggle(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }
}
