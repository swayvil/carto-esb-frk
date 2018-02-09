/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CartoService } from './carto.service';

describe('CartoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartoService]
    });
  });

  it('should ...', inject([CartoService], (service: CartoService) => {
    expect(service).toBeTruthy();
  }));
});
