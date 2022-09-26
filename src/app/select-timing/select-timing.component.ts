import { Component, OnInit , ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PickerController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';
import { IonSlides} from '@ionic/angular';
import { ApiDataService } from '../services/api-data.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-select-timing',
  templateUrl: './select-timing.component.html',
  styleUrls: ['./select-timing.component.scss'],
})
export class SelectTimingComponent implements OnInit {

  @ViewChild('mySlider')  slides: IonSlides;

  ID: any = '';
  HEADING: string = "3";
  CURRENT_MONTH: number = this.dataService.CURRENT_MONTH;
  CURRENT_YEAR: number = this.dataService.CURRENT_YEAR;
  CURRENT_MONTH_VALUE: string = '';
  DAYS_ARRAY : any = [];
  MORNING_SHIFT : any = [];
  EVENING_SHIFT : any = [];
  ALL_SHIFT : any = [];
  ACTIVE_DAY: number = 10;
  CANCEL_BOOKING_ID: number = 0;
  IS_STAFF: any = true;
  IS_CALNDER_OPEN: boolean = true;
  date: string = '';
  DATE_TYPE: 'object';
  STAFF_BOOKING_LIST: any = [];
  COMPAREBLE_DATES: any = [];
  MONTH_NAME_LIST: any = [];
  DISABLED_DATES_ARRAY: any = [];
  
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
    private router: Router,
    private activateRoute: ActivatedRoute,
    private location: Location,
    private pickerCtrl: PickerController,
    public dataService: DataService,
    public apiService: ApiDataService,
    private modalController: ModalController
    ) {

    }

  ngOnInit() {}

  async ionViewWillEnter () {


    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        console.log('params',params.hasOwnProperty('id') ? params : ''); // { orderby: "price" }
      }
    );

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH-1]+" "+ this.CURRENT_YEAR
    
    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);

    if (staff_detail.length > 0) {

      let weekly_off_days = [];

      await this.dataService.DAYS_OFF_NUMBER.map( 
        async (data) =>  {

          let check_day_off = await staff_detail[0].staffDetailFormatted.filter(staff_days => staff_days.dayId == data)
         
            if(check_day_off.length == 0) {
            
              weekly_off_days.push(data == 7 ? 0 : data)
            }
        }
      );

      this.options.disableWeeks = weekly_off_days;
    }
    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);
    
    let current_date = await this.getCurrentDate();
    this.ALL_SHIFT = await this.dataService.getShift(current_date);

    this.MORNING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.MORNING_SHIFT);
    this.EVENING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.EVENING_SHIFT);
    this.STAFF_BOOKING_LIST = await this.dataService.getStaffBookingDetail(booking_data?.staff_id)

    await this.getDisabledDates();
    await this.getDisabledShift();
    

    if (booking_data.date != '') this.prefilleddata();
  }

  async ionViewWillLeave () {
    
    this.IS_CALNDER_OPEN = false;
    this.modalController.dismiss();
  }


  async prefilleddata () {

    let booking_data = await this.dataService.getInitialBookingdata();

    this.date = booking_data.date;
    await this.onDateSelect(this.date)
    setTimeout(() => {
      this.MORNING_SHIFT[booking_data.timing_id-1].is_active = true;
    
    }, 300);
   
  }

  async getDisabledDates (){

    let array = [];

    for(let value of this.STAFF_BOOKING_LIST){
        
      let [date, time] = value.startTime.split('T');
      array.push(date)
    }

    let uniq_dates = [...new Set(array)];

    this.DISABLED_DATES_ARRAY = [];

    for(let current_date of uniq_dates) {

      let all_booked = true;

      for(let shift of this.ALL_SHIFT) {

        let current_date_booking = await this.STAFF_BOOKING_LIST.filter( data => data.startTime.includes(current_date));
        
        for(let booking_detail of current_date_booking) {

          let from_date = new Date(booking_detail.startTime);
          let to_date = new Date(booking_detail.endTime)
          to_date.setMinutes(to_date.getMinutes() - 1)
          
          let check_date = new Date(current_date+'T'+shift.value);

          if (check_date >= from_date && check_date <= to_date){  
          } else {
            all_booked = false;
          }
        }
      }

      if (all_booked) { this.DISABLED_DATES_ARRAY.push(current_date) }
      
    }

    
    if (this.DISABLED_DATES_ARRAY.length > 0) {

      let daysConfig = [];

      for (let value of this.DISABLED_DATES_ARRAY){
        daysConfig.push({date: new Date(value) , disable: true})
      }

      this.options = { daysConfig: daysConfig } // Set Disabled Dates in Datepicker

    }

    //  Set Date and Slider range values

    this.date = `${new Date().getFullYear()}-${new Date().getMonth() +1 < 10 ? '0'+(new Date().getMonth() +1) : new Date().getMonth() +1}-${new Date().getDate()}`;

    for (let index in this.DAYS_ARRAY){

      let create_date = `${new Date().getFullYear()}-${new Date().getMonth() +1 < 10 ? '0'+(new Date().getMonth() +1) : new Date().getMonth() +1}-${this.DAYS_ARRAY[index].day_number < 10 ? '0'+this.DAYS_ARRAY[index].day_number : this.DAYS_ARRAY[index].day_number}`
      
      let is_exist_in_disbaled = this.DISABLED_DATES_ARRAY.filter(data => data == create_date);

      let booking_data = await this.dataService.getInitialBookingdata();
      let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);

      let is_date_off = await this.dataService.isDateOff(create_date);

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)


      this.DAYS_ARRAY[index].is_disabled = is_exist_in_disbaled.length > 0 ? true : (new Date(create_date) < new Date(yesterday) || is_date_off ? true : false);
    }

    this.slides.slideTo(new Date().getDate()-1,1000);//(index_number, speed_time)
    this.DAYS_ARRAY[new Date().getDate()-1].is_active = true;
    console.log('final dates---', this.DAYS_ARRAY)
  }

  

  async openPicker() {

    this.IS_CALNDER_OPEN = false;
    setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
    
  }

  

  async onDateSelect (selected_date: any){
    
    this.IS_CALNDER_OPEN = false;
    //await this.modalController.dismiss();
    this.date = selected_date

    
    
    let [year , month , date] = this.date.split('-')
    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);
    
    for (let index in this.DAYS_ARRAY){

      let create_date = `${year}-${parseInt(month) < 10 ? '0'+month : month}-${this.DAYS_ARRAY[index].day_number < 10 ? '0'+this.DAYS_ARRAY[index].day_number : this.DAYS_ARRAY[index].day_number}`
      
      let is_exist_in_disbaled = await this.DISABLED_DATES_ARRAY.filter(data => data == create_date);

      let booking_data = await this.dataService.getInitialBookingdata();
      let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);

      let is_date_off = await this.dataService.isDateOff(create_date);

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      this.DAYS_ARRAY[index].is_disabled = is_exist_in_disbaled.length > 0 ? true : (new Date(create_date) < new Date(yesterday) || is_date_off ? true : false);
    }

    
    
    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()] + " "+new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;
    this.slides.slideTo(new_date.getDate()-1,1000);//(index_number, speed_time)
    
    this.getDisabledShift()
  }

  async selectDateRangeSlider (day: any, is_disabled: any, month: any, year: any){

    if (is_disabled) return;
    
    console.log(day, month, year);

    this.date = `${year}-${month}-${day < 10 ? '0'+day : day}`;

    console.log('this.date now ----', this.date)
    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);
    
    for (let index in this.DAYS_ARRAY){

      let create_date = `${year}-${month < 10 ? '0'+month : month }-${this.DAYS_ARRAY[index].day_number < 10 ? '0'+this.DAYS_ARRAY[index].day_number : this.DAYS_ARRAY[index].day_number}`
      
      let is_exist_in_disbaled = this.DISABLED_DATES_ARRAY.filter(data => data == create_date);

      let is_date_off = await this.dataService.isDateOff(create_date);

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      this.DAYS_ARRAY[index].is_disabled = is_exist_in_disbaled.length > 0 ? true : (new Date(create_date) < new Date(yesterday) || is_date_off ? true : false);
    }


    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()]+ ' '+ new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;
    this.slides.slideTo(new_date.getDate()-1,1000);//(index_number, speed_time)
      
    this.getDisabledShift();
  }

  async getDisabledShift () {
    
    this.ALL_SHIFT = await this.dataService.getShift(this.date);
    //console.log('selected date', this.STAFF_BOOKING_LIST)
  
    let selected_date_booking_list = await this.STAFF_BOOKING_LIST.filter(data => data.startTime.includes(this.date))
    
    selected_date_booking_list.sort(function (a, b) { return a.startTime.localeCompare(b.startTime); });
    console.log('selected_date_booking_list-----', this.date, selected_date_booking_list)
 
    for (let index in this.ALL_SHIFT){

      let new_date = new Date(`${this.date} ${this.ALL_SHIFT[index].value}`);
      
      for (let value of selected_date_booking_list) {

        let start_time = new Date(value.startTime)
        let end_time = new Date(value.endTime)
        end_time.setMinutes(end_time.getMinutes() - 1)
        

        if (this.ALL_SHIFT[index].is_disabled == false) {

          if ((start_time <= new_date && end_time >= new_date) ){
            
            this.ALL_SHIFT[index].is_disabled = true;
          }
        }
      } 
      //console.log('new_date --------', this.ALL_SHIFT[index].time , this.ALL_SHIFT[index].is_disabled)
    }

    this.MORNING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.MORNING_SHIFT);
    this.EVENING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.EVENING_SHIFT);
    console.log('new_date --------', this.ALL_SHIFT)
  }


  async selectTiming (id: number , timing_type: any, is_disabled : any){

    if (is_disabled) return ;

    let date_not_available = this.DISABLED_DATES_ARRAY.filter(data => data == this.date)

    if (date_not_available.length > 0) {
      
      await this.apiService.presentAlert('Please select a available date')
      return
    }

    let selecetd_shift = this.ALL_SHIFT.filter(data => data.id == id);
    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.date = this.date;
    get_booking_data.timing_id = id;

    console.log('selecetd_shift--', selecetd_shift)

    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration;

    let starting_date_time = new Date(`${this.date} ${selecetd_shift[0].value}`);
    let ending_date_time = new Date(`${this.date} ${selecetd_shift[0].value}`);

    ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration)
    ending_date_time = new Date(ending_date_time);


    
    let is_passed = true;
    for (let shift of this.ALL_SHIFT) {

      let new_date = new Date(`${this.date} ${shift.value}`)
      
      if (starting_date_time <= new_date && ending_date_time >= new_date && shift.is_disabled) {
        
        is_passed = false;
      }
    }

    if (!is_passed) {

      await this.apiService.presentAlert('Shift not available')
      return;
    }

    
    for (let m_shift of this.MORNING_SHIFT) m_shift.is_active = m_shift.id == id ? true : false;

    //for (let e_shift of this.EVENING_SHIFT) e_shift.is_active = e_shift.id == id ? true : false;

    await this.dataService.setBookingData(get_booking_data)
    
    console.log('get_booking_data>>>>>>>', get_booking_data)
    setTimeout(() => { this.router.navigate(['/booking-summary'] , { queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } }) }, 200);
    
  }

  async getCurrentDate () {

    let today_date = new Date();
    let year: any = today_date.getFullYear();
    let month:any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    return  year + '-' + month + '-' + day;
  
  }

  navigation() {

    this.location.back();
  }

}
