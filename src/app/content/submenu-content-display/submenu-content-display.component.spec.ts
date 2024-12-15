import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmenuContentDisplayComponent } from './submenu-content-display.component';

describe('SubmenuContentDisplayComponent', () => {
  let component: SubmenuContentDisplayComponent;
  let fixture: ComponentFixture<SubmenuContentDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmenuContentDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmenuContentDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
