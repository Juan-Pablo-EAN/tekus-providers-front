import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogServices } from './dialog-services';

describe('DialogServices', () => {
  let component: DialogServices;
  let fixture: ComponentFixture<DialogServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
