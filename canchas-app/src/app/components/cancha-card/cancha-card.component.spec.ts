import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanchaCardComponent } from './cancha-card.component';

describe('CanchaCardComponent', () => {
  let component: CanchaCardComponent;
  let fixture: ComponentFixture<CanchaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanchaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanchaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
