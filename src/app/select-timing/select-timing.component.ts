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
    //let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    
    this.DAYS_ARRAY =  await this._getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);
    this.STAFF_BOOKING_LIST = await this.dataService.getStaffBookingDetail(booking_data?.staff_id)

    
    await this.checkLogin();
    await this._getDisabledDate();
    this.DATE = await this.getCurrentDate();
    await this._getDayList();

    if (booking_data.date != '') {
      await this._preFilledData();
    } else {

      this.IS_CALNDER_OPEN = true;
    }
   
  }

  async ionViewWillLeave () {
    
    this.IS_CALNDER_OPEN = false;
    await this.modalController.dismiss();
  }

  async _preFilledData () {

    console.log('pre')
    this.IS_CALNDER_OPEN = false;
    let booking_data = await this.dataService.getInitialBookingdata();
    
    this.DATE = booking_data.date;
    
    //await this._onDateSelect(this.DATE);
    
    //await this.modalController.dismiss();
    
    await this._getDayList();
    console.log('indises')
    if (booking_data.timing_id != ''){

      console.log('indises')
      setTimeout(() => {
        console.log('booking_data.timing_id----' , booking_data.timing_id)
        this.ALL_SHIFT[booking_data.timing_id.id-1].is_active = true;
        console.log('this.ALL_SHIFT---' , this.ALL_SHIFT)
      }, 300);
    }
    
   
  }


  async _selectTiming (id: number , is_disabled : any){

    console.log('id----' , id , is_disabled)
    if (is_disabled) return ;

    let selecetd_shift = this.ALL_SHIFT.filter(data => data.id == id);

    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.date = this.DATE;

    get_booking_data.timing_id = selecetd_shift[0]; 

    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration;

    let starting_date_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);
    let ending_date_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);

    ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration -1)
    ending_date_time = new Date(ending_date_time);

    let pen_book_end_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);
    pen_book_end_time.setMinutes(pen_book_end_time.getMinutes() + total_duration)
    pen_book_end_time = new Date(pen_book_end_time);
    pen_book_end_time = <any> await this.returnDateTimeFormat(pen_book_end_time);

    let create_pending_booking_start_time = await this.returnDateTimeFormat(starting_date_time);
    let create_pending_booking_end_time = await this.returnDateTimeFormat(ending_date_time);

    let is_passed = true;
    for (let shift of this.ALL_SHIFT) {

      let new_date = new Date(`${this.DATE} ${shift.value}`);
      
      if (starting_date_time <= new_date && ending_date_time >= new_date && shift.is_disabled) {
        
        is_passed = false;
      }
    }

    if (!is_passed) {

      await this.apiService.presentAlert('Shift not available')
      return;
    }

    

    // Check services's time is under office timing

    let office_last_shift = new Date (`${get_booking_data.date} ${this.ALL_SHIFT[this.ALL_SHIFT.length - 1].value}` );
    let office_closed_time = new Date(office_last_shift.setMinutes(office_last_shift.getMinutes() + 30));

    if (ending_date_time > office_closed_time) {

      await this.apiService.presentAlert('Sorry outside of business owner working days')
      return
    }

    if (!this.IS_LOGIN) {

      await this.dataService.setPreviousUrl('select-a-time');
      this.auth
      .buildAuthorizeUrl()
      .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
      .subscribe();

      return
    }
    
    for (let shift of this.ALL_SHIFT) shift.is_active = shift.id == id ? true : false;
    console.log('passed');

    await this.apiData.presentLoading();

    // await this.dataService.setBookingData(get_booking_data);
    // setTimeout(() => { this.router.navigate(['/booking-summary'] , { queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } }) }, 200);
    // //await this.dataService.setBookingData(get_booking_data)
    // console.log('selecetd_shift---' , selecetd_shift)

    await this.auth.getUser().subscribe(
      async (response: any) => { 

        //response.email = 'gomanagetest@gmail.com';

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => { 

            
            //console.log('user_info' , user_info);
            
            let data = {
                          "userId": user_info.userGMID,
                          "staffId": get_booking_data.staff_id,
                          "isPending": 1,
                          "startTime": create_pending_booking_start_time,
                          "endTime": pen_book_end_time,
                          "serviceId": get_booking_data.servises[0].id
                      };

            (await this.apiData.createPendingAppointment(data)).subscribe(
              async (response: any) => {

                await this.apiData.dismiss();
                //console.log('response-------pppppppp' , response.status)
              },
              async (error:any) => {
                await this.apiData.dismiss();

                if (error.status == 200) {

                  await this.dataService.setBookingData(get_booking_data)
                  
                  // remove temprary booking after 5 minutes = 300000

                  this.PENDING_BOOKING_TIMEOUT =  setTimeout(async () => { 
                    
                    this.removePendingBooking();
                  }, 300000);

                  setTimeout(() => { this.router.navigate(['/booking-summary'] , { queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } }) }, 200);
                  
                } else if (error.status == 201){

                  await this.apiService.presentAlert('Shift not available')
                  return
                
                } else {

                  
                  await this.apiData.presentAlert('pending booking server error'+ JSON.stringify(error))
                }

                //console.log('pending booking server error ', error)
                
              }
            );


          },
          
          async (error:any) => {
            await this.apiData.dismiss();
            //console.log('profile error ', error)
            await this.apiData.presentAlert('user profile error'+ JSON.stringify(error))
          }
        )

      },
      async (error:any) => {
        await this.apiData.dismiss();
        //console.log('auth error ', error)
        await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    );
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
    
    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && new Date(data.workDate) >= new Date(yesterday))
      }
    }

    for (let value of day_list){

      let is_date_working = await staff_availability_dates.filter( data => data.workDate == value.full_date);

      
      if (is_date_working.length == 0) { // if rota not exist according for date

        value.is_disabled = true
      } else {

        let is_all_shift_booked =  (await this._isDateDisabled(value.full_date)).filter( data => !data.is_disabled); // Check is all shift of date is booked or not

        if (is_all_shift_booked.length == 0) value.is_disabled = true; // If all shift of date is booked
      }

      value.is_active = value.full_date == this.DATE ? true : false;
    }

    this.DAYS_ARRAY = day_list;

    let active_index_array = await day_list.filter(data => data.is_active);
    let active_index = active_index_array.length > 0 ? active_index_array[0].day_number : 0;
    
    this.slides.slideTo(active_index-1,1000);
    
    await this._getShiftList();
  }

  async _getShiftList () {

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_availability_dates =  [];
      
    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {

        staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && data.workDate == this.DATE)
      }
    }

    console.log('staff_availability_dates------' , staff_availability_dates);
    let current_date_booking = await this.STAFF_BOOKING_LIST.filter( data => data.startTime.includes(this.DATE));

    //console.log('current_date_booking---', this.DATE , current_date_booking);

    let shift_start_time: any = '';
    let shift_end_time: any = ''

    if (staff_availability_dates.length > 0) {

      // get shift start time & end time
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

      // Get shift timing list
      this.ALL_SHIFT = await this._returnTimesInBetween(shift_start_time , shift_end_time);

      // Shift disabled based on break time---- start
     
      for (let shift_value of this.ALL_SHIFT) {

        if (!shift_value.is_disabled) { // If shift is not disabled

          let shift__date_time = new Date(`${this.DATE}T${shift_value.value}:00`);
      
          for (let value of staff_availability_dates) {
            if (value.outOfOfficeFrom != null && value.outOfOfficeTo != null) {
              
              let break_start_time = new Date(`${this.DATE}T${value.outOfOfficeFrom}`);
              let break_end_time = new Date(`${this.DATE}T${value.outOfOfficeTo}`)
              break_end_time.setMinutes(break_end_time.getMinutes() - 1);
    
              // Shift will be disabled if shift time will exist in between break start & break end time
              if (break_start_time.getTime() <= shift__date_time.getTime() && break_end_time.getTime() >= shift__date_time.getTime()) {
  
                //console.log('shift_value.value----' , shift_value.value);
                shift_value.is_disabled = true; // Disabled the shift
              }
             
            }
          }
        }
        
      }

      // Shift disabled based on break time---- end

      console.log('current_date_booking--' ,current_date_booking)
      // Shift disabled based on Booking time -- start

      if (current_date_booking.length > 0) { // If bookings exist on selected date
        
        for (let shift_value of this.ALL_SHIFT) {

          if (!shift_value.is_disabled) { // If shift is not disabled
            
            let shift__date_time = new Date(`${this.DATE}T${shift_value.value}:00`);
            for (let booking_value of current_date_booking) {

              let booking_start_time = new Date(booking_value.startTime);
              let booking_end_time = new Date(booking_value.endTime);
              booking_end_time.setMinutes(booking_end_time.getMinutes() - 1);
    
              // Shift will be disabled if shift time will exist in between booking start & booking end time
              if (booking_start_time.getTime() <= shift__date_time.getTime() && booking_end_time.getTime() >= shift__date_time.getTime()) {

                shift_value.is_disabled = true; // Disabled the shift
              }
            }
            
          }
        }
      }
      
      // Shift disabled based on Booking time -- end
      let booking_data = await this.dataService.getInitialBookingdata();
      let booking_total_duration = 0;
      let total_shift_will_count = 1;

      for (let value of booking_data.servises) booking_total_duration += value.serviceDuration;

      booking_total_duration = booking_total_duration - 1;
      console.log('booking_total_duration---' , booking_total_duration);

      total_shift_will_count = booking_total_duration == 0 ? ~~(booking_total_duration / 30) : (~~(booking_total_duration / 30) + 1)

      console.log('total_shift_will_count--' , total_shift_will_count);
      console.log('booking_data-----' , booking_data);


      // Set Soft disabled 
      if (total_shift_will_count != 1) {

        for (let index in this.ALL_SHIFT) {
          
          let checked_pass = true;
          
          if (this.ALL_SHIFT[index]['is_disabled'] == false) {
  
            for (let i = 1; i < total_shift_will_count; i++) {
              
              let num = Number(index)+i;
             
  
              if (typeof this.ALL_SHIFT[num] !== 'undefined') {
  
                if (this.ALL_SHIFT[num]['is_disabled'] == true && checked_pass == true) {
                
                  checked_pass = false;
                }
    
              } else {
  
                checked_pass = false;
              }
            }
  
            if (!checked_pass) {
  
              this.ALL_SHIFT[index]['is_disabled'] = true;
              this.ALL_SHIFT[index]['soft_disabled'] = true;
            }
          }
        }
      } 
    } else {

      return
    }

    console.log('All Shift----' , this.ALL_SHIFT);

    return
    
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
                        day_number: i < 10 ? '0'+i : i.toString(), 
                        is_disabled: false, 
                        is_active: false, 
                        month: month, 
                        year: year , 
                        day_name: dayName ,
                        full_date: year + '-' + month + '-' + (i < 10 ? '0'+i : i)
                      })

    }
    return days_list;
  }


  async _selectDateRangeSlider(day: any, is_disabled: any, month: any, year: any , index: any) {

    
    console.log(day , is_disabled  , month  , year , index);
    if (is_disabled) return;
    this.DATE = `${year}-${month}-${day}`;

    for (let value of this.DAYS_ARRAY) value.is_active = false;
    this.DAYS_ARRAY[index]['is_active'] = true;
    this.slides.slideTo(index-1,1000);
    console.log('shift' , this.DAYS_ARRAY[index]) 
    await this._getShiftList();
  }

  async _onDateSelect(selected_date: any) {

    //console.log('selected_date-----' ,selected_date)
    this.DATE = selected_date;
    this.IS_CALNDER_OPEN = false;
    await this.modalController.dismiss();
    await this._getDayList();
  }

  async _getDisabledDate () {

    //console.log(await this._returnDateInBetween());
    //console.log(await this._returnDateInBetween(new Date('2023-03-03') , new Date('2023-03-10')));
    let all_dates = await this._returnDateInBetween();

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_rota =  [];
    let current_date =  await this.getCurrentDate();
    console.log('staff_detail--' , staff_detail);
    
    

    if (staff_detail[0].staffDetailFormatted != null) { 

      if (staff_detail[0].staffDetailFormatted.length > 0) {

        // Get  staff rota
        staff_rota = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && new Date(data.workDate) >= new Date(current_date))
      }
    }
    
    

    let daysConfig = [];

    for (let value of all_dates){

      let is_date_working = await staff_rota.filter( data => data.workDate == value);

      if (is_date_working.length == 0) { // If rota not found on current loop date

        daysConfig.push({date: new Date(value) , disable: true});
        
      } else {

        let is_all_shift_booked =  (await this._isDateDisabled(value)).filter( data => !data.is_disabled);
        
        if (is_all_shift_booked.length == 0) daysConfig.push({date: new Date(value) , disable: true});
        
      }
      
    }

    this.options = { daysConfig: daysConfig } // Set Disabled Dates in Datepicker

  }

  async _isDateDisabled(value: any) {

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_rota =  [];
    let current_date =  await this.getCurrentDate();
    
    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {

        // Get  staff rota
        staff_rota = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && new Date(data.workDate) >= new Date(current_date))
      }
    }
    
    let is_date_working = await staff_rota.filter( data => data.workDate == value);

    let current_date_booking = await this.STAFF_BOOKING_LIST.filter( data => data.startTime.includes(value));
    let shift_start_time: any = '';
    let shift_end_time: any   = '';

    if (is_date_working.length > 1) {

      shift_start_time = is_date_working[0]?.startShiftTime;
      shift_end_time = is_date_working[1]?.endShiftTime;
    } else {
      shift_start_time = is_date_working[0]?.startShiftTime;
      shift_end_time = is_date_working[0]?.endShiftTime;
    }

    shift_end_time  = new Date(`${value}T${shift_end_time}`);
    shift_end_time.setMinutes(shift_end_time.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

    shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes())+":"+(shift_end_time.getSeconds() == 0 ? '00': shift_end_time.getSeconds())

  
    let all_shift_list = await this._returnTimesInBetween(shift_start_time , shift_end_time); // Get shift timing list


        // Shift disabled based on break time---- start
      
        for (let shift_value of all_shift_list) {

          if (!shift_value.is_disabled) { // If shift is not disabled

            let shift__date_time = new Date(`${value}T${shift_value.value}:00`);
        
            for (let values of is_date_working) {
              if (values.outOfOfficeFrom != null && values.outOfOfficeTo != null) {
                
                let break_start_time = new Date(`${value}T${values.outOfOfficeFrom}`);
                let break_end_time = new Date(`${value}T${values.outOfOfficeTo}`)
                break_end_time.setMinutes(break_end_time.getMinutes() - 1);
      
                // Shift will be disabled if shift time will exist in between break start & break end time
                if (break_start_time.getTime() <= shift__date_time.getTime() && break_end_time.getTime() >= shift__date_time.getTime()) {
    
                  shift_value.is_disabled = true; // Disabled the shift
                }
              
              }
            }
          }
          
        }

        // Shift disabled based on break time---- end

        // Shift disabled based on Booking time -- start

        if (current_date_booking.length > 0) { // If bookings exist on selected date
          
          for (let shift_value of all_shift_list) {

            if (!shift_value.is_disabled) { // If shift is not disabled
              
              let shift__date_time = new Date(`${value}T${shift_value.value}:00`);
              for (let booking_value of current_date_booking) {

                let booking_start_time = new Date(booking_value.startTime);
                let booking_end_time = new Date(booking_value.endTime);
                booking_end_time.setMinutes(booking_end_time.getMinutes() - 1);
      
                // Shift will be disabled if shift time will exist in between booking start & booking end time
                if (booking_start_time.getTime() <= shift__date_time.getTime() && booking_end_time.getTime() >= shift__date_time.getTime()) {

                  shift_value.is_disabled = true; // Disabled the shift
                }
              }
              
            }
          }

          

        }
      
        // Shift disabled based on Booking time -- end

        return all_shift_list
        
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

  async _returnTimesInBetween(start, end) {
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


  async removePendingBooking () {

    await this.auth.getUser().subscribe(
      async (response: any) => { 

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => { 

            //console.log('user_info' , user_info);

              (await this.apiData.removeUserPendingBoking(user_info.userGMID)).subscribe(
                (response: any) => {

                  //console.log('hiddin---' , response)
                },

                (error: any) => {

                  //console.log('error---' , error)
                }
              );
          },
          
          async (error:any) => {
            await this.apiData.dismiss();
            // console.log('profile error ', error)
            // await this.apiData.presentAlert('user profile error'+ JSON.stringify(error))
          }
        )

      },
      async (error:any) => {
        await this.apiData.dismiss();
        // console.log('auth error ', error)
        // await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    );
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
