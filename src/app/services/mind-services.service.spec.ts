import { TestBed } from '@angular/core/testing';

import { MindServicesService } from './mind-services.service';

describe('MindServicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MindServicesService = TestBed.get(MindServicesService);
    expect(service).toBeTruthy();
  });
});
