import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MindIdFormComponent } from './mind-id-form.component';

describe('MindIdFormComponent', () => {
  let component: MindIdFormComponent;
  let fixture: ComponentFixture<MindIdFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MindIdFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MindIdFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
