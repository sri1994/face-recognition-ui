import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MindDetailsModalComponent } from './mind-details-modal.component';

describe('MindDetailsModalComponent', () => {
  let component: MindDetailsModalComponent;
  let fixture: ComponentFixture<MindDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MindDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MindDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
