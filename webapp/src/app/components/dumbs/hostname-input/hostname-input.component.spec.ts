import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostnameInputComponent } from './hostname-input.component';

describe('HostnameInputComponent', () => {
  let component: HostnameInputComponent;
  let fixture: ComponentFixture<HostnameInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [HostnameInputComponent]
});
    fixture = TestBed.createComponent(HostnameInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
