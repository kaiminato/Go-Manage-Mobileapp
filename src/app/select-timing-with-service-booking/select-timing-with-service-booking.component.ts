import { Component, OnInit , ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';
import { Router } from '@angular/router';
import { ModalController, PickerController ,IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-select-timing-with-service-booking',
  templateUrl: './select-timing-with-service-booking.component.html',
  styleUrls: ['./select-timing-with-service-booking.component.scss'],
})
export class SelectTimingWithServiceBookingComponent implements OnInit {

  @ViewChild('mySlider')  slides: IonSlides;

  HEADING: any = '2';
  IS_CALNDER_OPEN: boolean = true;
  date: string = '';
  CURRENT_MONTH: number = this.dataService.CURRENT_MONTH;
  CURRENT_YEAR: number = this.dataService.CURRENT_YEAR;
  CURRENT_MONTH_VALUE: string = '';
  DAYS_ARRAY : any = [];
  ALL_SHIFT : any = [];
  MORNING_SHIFT: any = [];
  ACTIVE_DAY: number = 25;
  DATE_TYPE: 'object';
  MONTH_NAME_LIST: any = [];

  slideOpts = {
    slidesPerView: 6,
    initialSlide: 10,
    speed: 400,
    loop: false,
  };

  options: CalendarModalOptions = {
    //disableWeeks: [0, 6],
    daysConfig: [
        // {
        //   date: new Date('2022-09-20'),
        //   disable: true,
        //   cssClass:'line',
        // },
        // {
        //   date: new Date('2022-09-22'),
        //   disable: true,
        // }
      ]
    };

  constructor(
    private location: Location,
    private dataService: DataService,
    private router: Router,
    private pickerCtrl: PickerController,
    private modalController: ModalController) { }

  ngOnInit() {}

  async ionViewWillEnter (){

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH-1]+" "+ this.CURRENT_YEAR;

    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);

    this.ALL_SHIFT = await this.dataService.getStaticShift();
    this.MORNING_SHIFT = [... this.ALL_SHIFT]
    console.log('this.DAYS_ARRAY------',this.DAYS_ARRAY)
  }

  async ionViewWillLeave () {
    
    this.IS_CALNDER_OPEN = false;
    this.modalController.dismiss();
  }

  async openPicker() {

    this.IS_CALNDER_OPEN = false;
    setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
    
  }

  async onDateSelect (selected_date: any){
    
    console.log('selected_date---', selected_date)
    this.date = selected_date;
    this.IS_CALNDER_OPEN = false;
    let [year , month , date] = this.date.split('-')

    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);

    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()] + " "+new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;
    this.slides.slideTo(new_date.getDate()-1,1000);//(index_number, speed_time)
    
  }

  async selectDateRangeSlider (day: any, is_disabled: any, month: any, year: any){

    if (is_disabled) return;
    this.date = `${year}-${month}-${day < 10 ? '0'+day : day}`;
    console.log(this.date)

    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()]+ ' '+ new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;
  }

  async selectTiming (id: number , timing_type: any, is_disabled : any){

    if (is_disabled) return ;


    let selecetd_shift = this.ALL_SHIFT.filter(data => data.id == id);
    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.date = this.date;
    get_booking_data.timing_id = id;
    
    for (let m_shift of this.MORNING_SHIFT) m_shift.is_active = m_shift.id == id ? true : false;

    //for (let e_shift of this.EVENING_SHIFT) e_shift.is_active = e_shift.id == id ? true : false;

    await this.dataService.setBookingData(get_booking_data)
    
    console.log('get_booking_data>>>>>>>', get_booking_data)
    setTimeout(() => { this.router.navigate(['/select-staff-with-service-booking']) }, 200);
    
  }

  navigation() {

    this.location.back();
  }
}
