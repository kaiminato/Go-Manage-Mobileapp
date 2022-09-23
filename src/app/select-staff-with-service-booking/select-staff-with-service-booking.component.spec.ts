import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectStaffWithServiceBookingComponent } from './select-staff-with-service-booking.component';

describe('SelectStaffWithServiceBookingComponent', () => {
  let component: SelectStaffWithServiceBookingComponent;
  let fixture: ComponentFixture<SelectStaffWithServiceBookingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectStaffWithServiceBookingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectStaffWithServiceBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
