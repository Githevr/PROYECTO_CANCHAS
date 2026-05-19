import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanchasSectionComponent } from './canchas-section.component';

describe('CanchasSectionComponent', () => {
  let component: CanchasSectionComponent;
  let fixture: ComponentFixture<CanchasSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanchasSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanchasSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
