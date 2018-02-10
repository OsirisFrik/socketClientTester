import { TestBed, inject } from '@angular/core/testing';

import { ElectronSvService } from './electron-sv.service';

describe('ElectronSvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElectronSvService]
    });
  });

  it('should be created', inject([ElectronSvService], (service: ElectronSvService) => {
    expect(service).toBeTruthy();
  }));
});
