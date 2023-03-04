import { Component, OnInit , ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PickerController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';
import { IonSlides} from '@ionic/angular';
import { ApiDataService } from '../services/api-data.service';
import { ModalController } from '@ionic/angular';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-select-timing',
  templateUrl: './select-timing.component.html',
  styleUrls: ['./select-timing.component.scss'],
})
export class SelectTimingComponent implements OnInit {

  @ViewChild('mySlider')  slides: IonSlides;
  // @ViewChild('myCalander') myCalander!: ElementRef; 
 

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
  IS_CALNDER_OPEN: boolean = false;
  date: string = '';
  DATE_TYPE: 'object';
  STAFF_BOOKING_LIST: any = [];
  COMPAREBLE_DATES: any = [];
  MONTH_NAME_LIST: any = [];
  DISABLED_DATES_ARRAY: any = [];
  IS_LOGIN: boolean = false;
  PENDING_BOOKING_TIMEOUT: any;

  SHORT_MONTHS_NAME: any =  { Jan: 1,  Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sept: 9,  Oct: 10, Nov: 11 , Dec: 12};
   
  
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
        //   date: new Date('2023-03-02'),
        //   disable: true,
        //   cssClass:'line',
        // },
        // {
        //   date: new Date('2023-03-03'),
        //   disable: true,
        // }
      ]
    };

    markDisabled: any = (date: Date) => {
      var current = new Date();
      return date < current;
  };
  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private location: Location,
    private pickerCtrl: PickerController,
    public dataService: DataService,
    public apiService: ApiDataService,
    private modalController: ModalController,
    public auth: AuthService,
    private apiData: ApiDataService,
    ) { 

     
    }

    async _monthChage ($event: any) {

      console.log('event---' , $event);
      // setTimeout(() => {
      //     console.log('vijay testomh')
      // }, 1000);

      // if (document.getElementsByClassName('switch-btn').length > 0 ) {
      //   console.log("test  " + document.getElementsByClassName('switch-btn')[0].textContent.trim())
      //   let [short_month_name , year] = document.getElementsByClassName('switch-btn')[0].textContent.trim().split(' ');
      //   console.log('short_month_name--' , short_month_name , 'year----' , year)
      //   console.log('get short--' , this.SHORT_MONTHS_NAME[short_month_name])

      // }
    }

    async _datePickerClosed () {
      console.log('closed')
      this.IS_CALNDER_OPEN = false;
    }

  ngOnInit() {}

  async ionViewWillEnter () {


    console.log('start---');
    
    console.log(await this._returnDateInBetween());
    console.log(await this._returnDateInBetween(new Date('2024-03-03') , new Date('2024-03-10')));


    console.log('end-----');

    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        
      }
    );

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH-1]+" "+ this.CURRENT_YEAR
    
    
    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);

    console.log('tst----' , JSON.stringify(staff_detail[0].staffDetailFormatted))

    
    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);
    console.log('this.DAYS_ARRAY---' , this.DAYS_ARRAY)

    await this._getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);

    // let current_date = await this.getCurrentDate();
    // this.ALL_SHIFT = await this.dataService.getShift(current_date);
    
    
    // this.MORNING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.MORNING_SHIFT);
    // this.STAFF_BOOKING_LIST = await this.dataService.getStaffBookingDetail(booking_data?.staff_id)


    if (booking_data.date != '') {
      //this.prefilleddata();
    } else {

      //this.IS_CALNDER_OPEN = true;
      //this.IS_CALNDER_OPEN = false;
      //setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
    }
  }

  async ionViewWillLeave () {
    
    this.IS_CALNDER_OPEN = false;
    this.modalController.dismiss();
  }


  async _getDays(month: any , year: any) {

    month = month.toString().length > 1 ? month : '0'+month
    
    let date = new Date();
    let firstDay = (new Date(parseInt(year), parseInt(month), 1)).getDate();
    let lastDay = (new Date(parseInt(year), parseInt(month) , 0)).getDate();

    console.log('month' , month , 'year' , year);
    console.log('firstDay' , firstDay , 'lastDay' , lastDay);

    let days_list = [];

    for (let i = 1; i <= lastDay; i++){

      let new_date = new Date(`${year}-${month}-${ i < 10 ? '0'+i : i}`);
      var dayName = this.dataService.SHORT_DAYS_NAME[new_date.getDay()];

      days_list.push({ 
                        day_number: i, 
                        is_disabled: false, 
                        is_active: false, 
                        month: month, 
                        year: year , 
                        day_name: dayName ,
                        full_date: year + '-' + month + '-' + (i < 10 ? '0'+i : i)
                      })

    }

    console.log('days_list---' , days_list)
    return days_list;
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
      let current_date_booking = await this.STAFF_BOOKING_LIST.filter( data => data.startTime.includes(current_date));
        
      for(let shift of this.ALL_SHIFT) {

        
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
    
    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);

    

    if (staff_detail.length > 0) {

      let weekly_off_days = [];

      await this.dataService.DAYS_OFF_NUMBER.map( 
        async (data) =>  {

          data = data-1;
          let check_day_off = await staff_detail[0].staffDetailFormatted.filter(staff_days => staff_days.dayId == data)
         
            if(check_day_off.length == 0) {
            
              weekly_off_days.push(data)
            }
        }
      );


      this.options.disableWeeks = weekly_off_days;
    }
    

    //  Set Date and Slider range values

    this.date = `${new Date().getFullYear()}-${new Date().getMonth() +1 < 10 ? '0'+(new Date().getMonth() +1) : new Date().getMonth() +1}-${new Date().getDate() < 10 ? '0'+new Date().getDate() : new Date().getDate()}`;

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
   
  }

  

  async openPicker() {

    
    setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
    
  }



  
  async _returnDateInBetween (start_date = new Date() , end_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1))) {

    for(var date_list=[],d=new Date(start_date);d<=new Date(end_date);d.setDate(d.getDate()+1))
    { 
        let today_date = new Date(d);
        let year:any = today_date.getFullYear();
        let month:any  = today_date.getMonth() + 1; // Months start at 0!
        let day: any = today_date.getDate();
    
        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;

        date_list.push(year + '-' + month + '-' + day);
        
    }

    return date_list;
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

  async returnDateTimeFormat (date_time){

    let today_date = new Date(date_time);
    let year: any = today_date.getFullYear();
    let month:any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();
    let hours: any = today_date.getHours();
    let minutes: any = today_date.getMinutes();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return  await year + '-' + month + '-' + day + 'T' + hours + ':' + minutes +':00.000Z';
  }


  async checkLogin () {

    await this.auth.getUser().subscribe(
      async (user_data: any) =>{

        if (user_data !== undefined){
          
          this.IS_LOGIN = true;

          
          clearTimeout(this.PENDING_BOOKING_TIMEOUT)
        }
      }
    );
  }

  navigation() {

    this.location.back();
  }

}
