import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PickerController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';

@Component({
  selector: 'app-select-timing',
  templateUrl: './select-timing.component.html',
  styleUrls: ['./select-timing.component.scss'],
})
export class SelectTimingComponent implements OnInit {

  ID: any = '';
  HEADING: string = "Select a time";
  CURRENT_MONTH: number = this.dataService.CURRENT_MONTH;
  CURRENT_YEAR: number = this.dataService.CURRENT_YEAR;
  CURRENT_MONTH_VALUE: string = 'August';
  DAYS_ARRAY : any = [];
  MORNING_SHIFT : any = [];
  EVENING_SHIFT : any = [];
  ALL_SHIFT : any = [];
  ACTIVE_DAY: number = 10;
  IS_STAFF: any = true;
  IS_CALNDER_OPEN: boolean = false;
  date: string;
  DATE_TYPE: 'object';
  STAFF_BOOKING_LIST: any = [];

  options: CalendarModalOptions = {
    daysConfig: [
        {
          date: new Date('2022-09-20'),
          disable: true,
          cssClass:'line',
        },
        {
          date: new Date('2022-09-22'),
          disable: true,
        }
      ]
    };

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private location: Location,
    private pickerCtrl: PickerController,
    public dataService: DataService
    ) {

    }

  ngOnInit() {}

  async ionViewWillEnter () {

    let booking_data = await this.dataService.getInitialBookingdata();
    console.log(this.ID, 'staff id')
    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_YEAR , this.CURRENT_YEAR);
    this.ALL_SHIFT = await this.dataService.getShift();
    this.MORNING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.MORNING_SHIFT);
    this.EVENING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.EVENING_SHIFT);
    this.STAFF_BOOKING_LIST = await this.dataService.getStaffBookingDetail(booking_data?.staff_id)

    console.log('this.STAFF_BOOKING_LIST---', this.STAFF_BOOKING_LIST)
  }

  slideOpts = {
    slidesPerView: 6,
    initialSlide: 10,
    speed: 400,
    loop: false,
  };

  async openPicker() {

    this.IS_CALNDER_OPEN = true;
    return;

  }

  async disabledDates() {

    this.options = {
      daysConfig:  [{
        date: new Date('2022-09-25'),
        disable: true,
    }, {
      date: new Date('2022-09-27'),
        disable: true,
    }],
    }
    
  }

  onDateSelect ($event){
    console.log($event.format('YYYY-MM-DD'));
  }

  selectTiming (id: number , timing_type){

    for (let m_shift of this.MORNING_SHIFT) m_shift.is_active = m_shift.id == id ? true : false;

    for (let e_shift of this.EVENING_SHIFT) e_shift.is_active = e_shift.id == id ? true : false;

    setTimeout(() => {
      this.router.navigate(['/booking-summary'])
    }, 200);
    //this.router.navigate(['/booking-summary'])
  }

  navigation() {

    this.location.back();
  }

}
