import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewProvider } from './dialog-new-provider';

describe('DialogNewProvider', () => {
  let component: DialogNewProvider;
  let fixture: ComponentFixture<DialogNewProvider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNewProvider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogNewProvider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
