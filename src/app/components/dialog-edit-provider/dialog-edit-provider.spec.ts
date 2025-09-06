import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditProvider } from './dialog-edit-provider';

describe('DialogEditProvider', () => {
  let component: DialogEditProvider;
  let fixture: ComponentFixture<DialogEditProvider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditProvider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditProvider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
