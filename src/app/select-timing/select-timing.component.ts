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
  DATE: string = '';
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

    

    async _datePickerClosed () {
      
      this.IS_CALNDER_OPEN = false;
    }

  ngOnInit() {}

  async ionViewWillEnter () {

    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        
      }
    );

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH]+" "+ this.CURRENT_YEAR
    
    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    
    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);
  

    // await this._getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);
    
    
    this.ALL_SHIFT = await this.dataService.getShift(this.DATE);
    
    await this._getDisabledDate();
    this.DATE = await this.getCurrentDate();
    await this._getDayList()
    //this.IS_CALNDER_OPEN = true;
    //this.IS_CALNDER_OPEN = false;
    //setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
   
  }

  async ionViewWillLeave () {
    
    this.IS_CALNDER_OPEN = false;
    this.modalController.dismiss();
  }


  async selectTiming (id: number , is_disabled : any){

    console.log('id----' , id)
    if (is_disabled) return ;
  }

  async _getDayList () {

    let today_date = new Date(this.DATE);
    let year: any = today_date.getFullYear();
    let month:any = today_date.getMonth() + 1; 
    let day_list = await this._getDays(month , year);

    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[today_date.getMonth()]+" "+ year

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_availability_dates =  [];
    
    if (staff_detail[0].staffDetailFormatted.length > 0) {

      staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && new Date(data.workDate) >= new Date(this.DATE))
    }

    for (let value of day_list){

      let is_date_working = await staff_availability_dates.filter( data => data.workDate == value.full_date);

      if (is_date_working.length == 0) {

        value.is_disabled = true
      }

      value.is_active = value.full_date == this.DATE ? true : false;
    }

    this.DAYS_ARRAY = day_list;

    let active_index_array = await day_list.filter(data => data.is_active);
    let active_index = active_index_array.length > 0 ? active_index_array[0].day_number : 0;
    console.log('active_index' , active_index)
    this.slides.slideTo(active_index-1,1000);

    await this._getShiftList()
  }

  async _getShiftList () {

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_availability_dates =  [];
      
    if (staff_detail[0].staffDetailFormatted.length > 0) {

      staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && data.workDate == this.DATE)
    }

    console.log('staff_availability_dates------' , staff_availability_dates);

    let shift_start_time: any = '';
    let shift_end_time: any = ''

    if (staff_availability_dates.length > 0) {

      if (staff_availability_dates.length > 1) {

        shift_start_time = staff_availability_dates[0]?.startShiftTime;
        shift_end_time = staff_availability_dates[1]?.endShiftTime;
      } else {
        shift_start_time = staff_availability_dates[0]?.startShiftTime;
        shift_end_time = staff_availability_dates[0]?.endShiftTime;
      }

      shift_end_time  = new Date(`${this.DATE}T${shift_end_time}`);
      shift_end_time.setMinutes(shift_end_time.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

      shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes())+":"+(shift_end_time.getSeconds() == 0 ? '00': shift_end_time.getSeconds())

      this.ALL_SHIFT = await this.returnTimesInBetween(shift_start_time , shift_end_time);

      for (let value of staff_availability_dates) {

        if (value.outOfOfficeFrom != null && value.outOfOfficeTo != null) {
          
          let start_time = new Date(`${this.DATE}T${value.outOfOfficeFrom}`)
          let end_time = new Date(`${this.DATE}T${value.outOfOfficeTo}`)
          end_time.setMinutes(end_time.getMinutes() - 1)

          // for (let ){

          // }
          console.log('value----' , start_time , end_time)
        }
      }

    } else {

      return
    }

    


    
    console.log('All Shift----' , this.ALL_SHIFT);
    
  }

  async _getDays(month: any , year: any) {

    month = month.toString().length > 1 ? month : '0'+month
    
    let date = new Date();
    let firstDay = (new Date(parseInt(year), parseInt(month), 1)).getDate();
    let lastDay = (new Date(parseInt(year), parseInt(month) , 0)).getDate();

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

    //console.log('current component---' , days_list)
    return days_list;
  }


  async _selectDateRangeSlider(day: any, is_disabled: any, month: any, year: any) {

    console.log(day , is_disabled  , month  , year)
  }

  async _onDateSelect(selected_date: any) {

    console.log('selected_date-----' ,selected_date)
    this.DATE = selected_date;
    await this._getDayList();
  }

  async _getDisabledDate () {

    //console.log(await this._returnDateInBetween());
    //console.log(await this._returnDateInBetween(new Date('2023-03-03') , new Date('2023-03-10')));
    let all_dates = await this._returnDateInBetween();

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_availability_dates =  [];
    let current_date =  await this.getCurrentDate();
    
    if (staff_detail[0].staffDetailFormatted.length > 0) {

      staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && new Date(data.workDate) >= new Date(current_date))
    }

    let daysConfig = [];

    for (let value of all_dates){

      let is_date_working = await staff_availability_dates.filter( data => data.workDate == value);

      if (is_date_working.length == 0) {

        daysConfig.push({date: new Date(value) , disable: true})
      }
      
    }
    this.options = { daysConfig: daysConfig } // Set Disabled Dates in Datepicker

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

    this.DATE = `${new Date().getFullYear()}-${new Date().getMonth() +1 < 10 ? '0'+(new Date().getMonth() +1) : new Date().getMonth() +1}-${new Date().getDate() < 10 ? '0'+new Date().getDate() : new Date().getDate()}`;

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

  async returnTimesInBetween(start, end) {
    var timesInBetween = [];
   
    var startH = parseInt(start.split(":")[0]);
    var startM = parseInt(start.split(":")[1]);
    var endH = parseInt(end.split(":")[0]);
    var endM = parseInt(end.split(":")[1]);
  
    if (startM == 30)
      startH++;
  
    for (var i = startH; i < endH; i++) {
      timesInBetween.push(i < 10 ? "0" + i + ":00" : i + ":00");
      timesInBetween.push(i < 10 ? "0" + i + ":30" : i + ":30");
    }
  
    timesInBetween.push(endH + ":00");
    if (endM == 30)
      timesInBetween.push(endH + ":30")
    let result = [];

    for (let timeString of timesInBetween) {

      let value = timeString;
      let H = +timeString.substr(0, 2);
      let h = (H % 12) || 12;
      let ampm = H < 12 ? " AM" : " PM";
      timeString = h + timeString.substr(2, 3) + ampm;
      result.push({
                    id: result.length + 1 ,
                    time: timeString ,   
                    value: value, 
                    is_active: false, 
                    is_disabled: false,
                    soft_disabled: false
                  });
    }

    return result;
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
