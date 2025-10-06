import { TestBed } from '@angular/core/testing';

import { ShenaiSdkService } from './shenai-sdk.service';

describe('ShenaiSdkService', () => {
  let service: ShenaiSdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShenaiSdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
