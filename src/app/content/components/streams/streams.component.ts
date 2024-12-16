import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streams',
  imports: [CommonModule],
  templateUrl: './streams.component.html',
  styleUrl: './streams.component.scss'
})
export class StreamsComponent {
  @Input() backgroundColor: string = 'rgb(44, 44, 44)';
}
