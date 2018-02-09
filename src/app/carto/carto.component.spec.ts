/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CartoComponent } from './carto.component';

describe('CartoComponent', () => {
  let component: CartoComponent;
  let fixture: ComponentFixture<CartoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
