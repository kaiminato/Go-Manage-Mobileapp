import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectTimingWithServiceBookingComponent } from './select-timing-with-service-booking.component';

describe('SelectTimingWithServiceBookingComponent', () => {
  let component: SelectTimingWithServiceBookingComponent;
  let fixture: ComponentFixture<SelectTimingWithServiceBookingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTimingWithServiceBookingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectTimingWithServiceBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
