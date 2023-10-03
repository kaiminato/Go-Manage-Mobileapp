import { Component, OnInit , ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';
import { Router , ActivatedRoute } from '@angular/router';
import { ModalController, PickerController ,IonSlides } from '@ionic/angular';
import { ApiDataService } from '../services/api-data.service';

@Component({
  selector: 'app-select-timing-with-service-booking',
  templateUrl: './select-timing-with-service-booking.component.html',
  styleUrls: ['./select-timing-with-service-booking.component.scss'],
})

export class SelectTimingWithServiceBookingComponent implements OnInit {

  @ViewChild('mySlider')  slides: IonSlides;

  HEADING: any = '2';
  IS_CALNDER_OPEN: boolean = false;
  date: string = '';
  DATE: string = '';
  CURRENT_MONTH: number = this.dataService.CURRENT_MONTH;
  CURRENT_YEAR: number = this.dataService.CURRENT_YEAR;
  CURRENT_MONTH_VALUE: string = '';
  DAYS_ARRAY : any = [];
  ALL_SHIFT : any = [];
  MORNING_SHIFT: any = [];
  ACTIVE_DAY: number = 25;
  DATE_TYPE: 'object';
  MONTH_NAME_LIST: any = [];
  CANCEL_BOOKING_ID: number = 0;
  ALL_STAFF: any = [];
  BOOKING_LIST: any = [];

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
    public dataService: DataService,
    private router: Router,
    private pickerCtrl: PickerController,
    private modalController: ModalController,
    private apiService: ApiDataService,
    private apiData: ApiDataService,
    private activateRoute: ActivatedRoute
    ) { }

  ngOnInit() {}

  async ionViewWillEnter (){

    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        
      }
    );
    this.BOOKING_LIST = await this.dataService.getStaffBookingList();

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH-1]+" "+ this.CURRENT_YEAR;

    this.DAYS_ARRAY =  await this._getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);
    this.ALL_STAFF = await this.dataService.getStaffList();
    this.DATE = await this.getCurrentDate();

    
    await this._getDisabledDate();
    
    await this._getDayList();
   
   

    // await this.setNonWorkingDaysOff() 
    

    // this.ALL_SHIFT = await this.dataService.getNewStaticShift(new Date().getDay());

    // this.MORNING_SHIFT = [... this.ALL_SHIFT]
    // let new_date = new Date();
    // this.slides.slideTo(new_date.getDate()-1,1000);

    // await this.getWeeklyDaysOff();
    // await this.preFilledData();
    // await this.getStaffBookingList();

  }

  async preFilledData () {

    let get_booking_data = await this.dataService.getInitialBookingdata();

    if (get_booking_data.timing_id  != '') {

      this.date = get_booking_data.date;
      await this.onDateSelect(this.date)
      setTimeout(() => {
        this.MORNING_SHIFT[get_booking_data.timing_id-1].is_active = true;
      
      }, 300);
    }
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

  async _getDisabledDate () {

    //console.log(await this._returnDateInBetween());
    //let all_dates = await this._returnDateInBetween(new Date('2023-03-14') , new Date('2023-03-17'));
    let all_dates = await this._returnDateInBetween();

    let booking_data = await this.dataService.getInitialBookingdata();
    //let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_rota =  [];
    let current_date =  await this.getCurrentDate();

    let daysConfig = [];

    for (let value of all_dates){

      let is_date_working = false; // initially date is not worknig true

      for (let staff_info of this.ALL_STAFF) {

        if (staff_info.staffDetailFormatted != null ) {
          if (staff_info.staffDetailFormatted.length > 0) {

            // Get  staff rota
            staff_rota = await staff_info.staffDetailFormatted.filter( data => data.description == '' && data.workDate == value)
           
            if (staff_rota.length > 0) is_date_working = true; // 
          }
        }
        
      }

      if (!is_date_working)  daysConfig.push({date: new Date(value) , disable: true});
      
    }

    //console.log('daysConfig---' , daysConfig)

    this.options = { daysConfig: daysConfig } // Set Disabled Dates in Datepicker

  }

  async _getDayList () {

    let today_date = new Date(this.DATE);
    let year: any = today_date.getFullYear();
    let month:any = today_date.getMonth() + 1; 
    let day_list = await this._getDays(month , year);

    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[today_date.getMonth()]+" "+ year;

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_availability_dates =  [];
    
    console.log('day_list----' , day_list);
    //console.log('getCurrentDate---' , await this.getCurrentDate())
    //return;

    for (let value of day_list){

      let is_date_working = false; // initially date is not worknig true
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1); 

      if (new Date((yesterday)) <= new Date(value.full_date)) { // past date will be off

        for (let staff_info of this.ALL_STAFF) {

          if (staff_info.staffDetailFormatted != null ) {
            if (staff_info.staffDetailFormatted.length > 0) {
    
          //     // Get  staff rota
              let staff_rota = await staff_info.staffDetailFormatted.filter( data => data.description == '' && data.workDate == value.full_date)
            
              if (staff_rota.length > 0) is_date_working = true; // 
            }
          }
        }
      }
      

      if (!is_date_working) value.is_disabled = true; // if rota not exist according for date
      value.is_active = value.full_date == this.DATE ? true : false;
    }
      
      

    this.DAYS_ARRAY = day_list;

    let active_index_array = await day_list.filter(data => data.is_active);
    let active_index = active_index_array.length > 0 ? active_index_array[0].day_number : 0;
    
    this.slides.slideTo(active_index-1,1000);

    await this._getShiftList();
    
  }
  

  async _getShiftList() {

    let time_list = [];
    for (let staff_info of this.ALL_STAFF) {

      if (staff_info.staffDetailFormatted != null ) {
        if (staff_info.staffDetailFormatted.length > 0) {

          //     // Get  staff rota
          let staff_rota = await staff_info.staffDetailFormatted.filter( data => data.description == '' && data.workDate == this.DATE)
          console.log('staff_rota----' , staff_rota);

          if (staff_rota.length > 0) {

            for (let rota_value  of staff_rota) {
              time_list.push( rota_value.startShiftTime); 
              time_list.push( rota_value.endShiftTime); 
            }
          } 
        }
      }
    }

    if (time_list.length > 0) {

      const getNumber = t => +t.replace(/:/g, '')
    

      console.log('time_list--before--' , time_list);
      time_list.sort((a,b) => getNumber(a) - getNumber(b));
      console.log('time_list--after--' , time_list);
      
      let shift_start_time = time_list[0];
      let shift_end_time = time_list[time_list.length-1];
      shift_end_time  = new Date(`${this.DATE}T${shift_end_time}`);
      shift_end_time.setMinutes(shift_end_time.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

      shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes())+":"+(shift_end_time.getSeconds() == 0 ? '00': shift_end_time.getSeconds())


      this.ALL_SHIFT = await this._returnTimesInBetween(shift_start_time , shift_end_time); // Get shift timing list

      console.log('all_shift_list--- before' , this.ALL_SHIFT);

      for (let shift of this.ALL_SHIFT) {
        let is_disabled = await this._isShiftAvailable(new Date(`${this.DATE}T${shift.value}:00`), shift.value);
        //console.log( `${this.DATE}T${shift.value}:00` , 'disbale', await this._isShiftAvailable(new Date(`${this.DATE}T${shift.value}:00`) , shift.value));
        shift.is_disabled = is_disabled == 'false' ? false : true;

        //console.log(`${this.DATE}T${shift.value}:00----` , is_disabled);
      }

      console.log('all_shift_list--- before' , this.ALL_SHIFT);
    }

    console.log( `${this.DATE}T16:30:00` , 'disbale', await this._isShiftAvailable(new Date(`${this.DATE}T16:30:00`) , '15:00'));
    // console.log('')
    // console.log('first')
    //console.log( `${this.DATE}T16:00:00` ,await this._isShiftAvailable(new Date(`${this.DATE}T16:00:00`), '16:00'));
    // console.log('')
    // console.log('second')
    //console.log( `${this.DATE}T13:30:00` ,await this._isShiftAvailable(new Date(`${this.DATE}T13:30:00`)));
  }

  async _isShiftAvailable(shift_date_time: any , selecetd_shift_value: any) {

    let is_available = 'true';
    //console.log('shift_date_time---' , shift_date_time);
    let booking_data = await this.dataService.getInitialBookingdata();
    let total_duration = 0;

    for (let service of booking_data.servises) total_duration += service.serviceDuration; // totao duration of service

    //console.log('total_duration-----' ,total_duration);


    let starting_date_time = new Date(`${this.DATE}T${selecetd_shift_value}`);
    let ending_date_time = new Date(`${this.DATE}T${selecetd_shift_value}`);
    ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration -1);
    ending_date_time = new Date(ending_date_time);

    
    for (let staff of this.ALL_STAFF) {

      let rota = [];

      if (staff.staffDetailFormatted != null) {
        
        rota = await staff.staffDetailFormatted.filter( data => data.description == '' && data.workDate == this.DATE);
      }

      if (rota.length > 0) {

        for (let value of rota) {
          let start_shift_timing = new Date(`${this.DATE}T${value.startShiftTime}`);
          let end_shift_timing = new Date(`${this.DATE}T${value.endShiftTime}`);
          end_shift_timing.setMinutes(end_shift_timing.getMinutes() - 1);
  
  
          if (start_shift_timing.getTime() <= shift_date_time.getTime() && end_shift_timing.getTime() >= shift_date_time.getTime()) {
           console.log()
  
            if ((value.outOfOfficeFrom != null && value.outOfOfficeTo != null) || (value.outOfOfficeFrom != '00:00:00' && value.outOfOfficeTo != '00:00:00')) {
              
              let break_start_time = new Date(`${this.DATE}T${value.outOfOfficeFrom}`);
              let break_end_time = new Date(`${this.DATE}T${value.outOfOfficeTo}`);
              break_end_time.setMinutes(break_end_time.getMinutes() - 1);
    
             
              // Shift will be disabled if shift time will exist in between break start & break end time
              if (is_available == 'true' && break_start_time.getTime() <= shift_date_time.getTime() && break_end_time.getTime() >= shift_date_time.getTime()) {
    
                //console.log('first condition----' , true);
                //is_available = true;
                //shift_value.is_disabled = true; // Disabled the shift
              } else {
               //console.log('second condition----' , false);
                is_available = 'false';
              }
             
            }
          } else {
            //console.log('dead------------')
            //is_available = 'false';
          }
        }
  
        if (is_available == 'false') {
          
          let shift_list = await this._getStaffShiftList(staff.employee_id , this.DATE);
  
          let is_passed = true;
          for (let shift of shift_list) {

            let new_date = new Date(`${this.DATE} ${shift.value}`);
            // console.log('starting_date_time--' , starting_date_time)
            // console.log('ending_date_time--' , ending_date_time)
            // console.log('new_date--' , new_date)
            //console.log('')
            if (starting_date_time <= new_date && ending_date_time >= new_date && shift.is_disabled) {
              
              is_passed = false;
            }
          }

          if (!is_passed) {

            is_available = 'true';
          }
        //console.log('is_availablet---', is_available , staff.employee_id)
        }
        
      }
      
    }

    //console.log('final-----------------------' , is_available)
    //console.log('' )
    
    return is_available
    
  }


  async _getStaffShiftList(staff_id: any , selected_date: any) {

    let staff_detail = await this.dataService.getStaffDetail(staff_id);
    let staff_availability_dates =  [];
      
    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {

        staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && data.workDate == selected_date)
      }
    }

    let current_date_booking = await this.BOOKING_LIST.filter( data => data.startTime.includes(selected_date) && staff_id == data.employeeId);
    let shift_start_time: any = '';
    let shift_end_time: any = ''

    //console.log('current_date_booking---' , staff_id , selected_date , current_date_booking)
    if (staff_availability_dates.length > 0) {

      // get shift start time & end time
      if (staff_availability_dates.length > 1) {

        shift_start_time = staff_availability_dates[0]?.startShiftTime;
        shift_end_time = staff_availability_dates[1]?.endShiftTime;
      } else {
        shift_start_time = staff_availability_dates[0]?.startShiftTime;
        shift_end_time = staff_availability_dates[0]?.endShiftTime;
      }

      shift_end_time  = new Date(`${selected_date}T${shift_end_time}`);
      shift_end_time.setMinutes(shift_end_time.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

      shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes())+":"+(shift_end_time.getSeconds() == 0 ? '00': shift_end_time.getSeconds())


      // Get shift timing list
      let all_shift = await this._returnTimesInBetween(shift_start_time , shift_end_time);
      
      
      // Shift disabled based on break time---- start
     
      for (let shift_value of all_shift) {

        if (!shift_value.is_disabled) { // If shift is not disabled

          let shift__date_time = new Date(`${selected_date}T${shift_value.value}:00`);
      
          for (let value of staff_availability_dates) {
            if (value.outOfOfficeFrom != null && value.outOfOfficeTo != null) {
              
              let break_start_time = new Date(`${selected_date}T${value.outOfOfficeFrom}`);
              let break_end_time = new Date(`${selected_date}T${value.outOfOfficeTo}`)
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

      // Shift disabled based on break time---- end)

      // Shift disabled based on Booking time -- start

      //console.log('current_date_booking---' , current_date_booking);
      if (current_date_booking.length > 0) { // If bookings exist on selected date
        
        for (let shift_value of all_shift) {

          if (!shift_value.is_disabled) { // If shift is not disabled
            
            let shift__date_time = new Date(`${selected_date}T${shift_value.value}:00`);
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

      //console.log('all_shift--' ,all_shift);
      return all_shift;
    }
  }


  async _selectDateRangeSlider(day: any, is_disabled: any, month: any, year: any , index: any) {

    
    console.log(day , is_disabled  , month  , year , index);
    if (is_disabled) return;
    this.DATE = `${year}-${month}-${day}`;
    console.log('this.DAYS_ARRAY----' ,this.DAYS_ARRAY);
    

    for (let value of this.DAYS_ARRAY) value.is_active = false;
    this.DAYS_ARRAY[index]['is_active'] = true;
    this.slides.slideTo(index-1,1000);
    //console.log('shift' , this.DAYS_ARRAY[index]) 
    await this._getShiftList();
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

  async setNonWorkingDaysOff () {

    let staff_list = await this.dataService.getStaffList();

    for (let current_date of this.DAYS_ARRAY){
      
      let created_date = new Date(`${current_date.year}-${current_date.month}-${current_date.day_number < 10 ? '0'+current_date.day_number : current_date.day_number}`);
      let is_date_disabled = true;

      if (!current_date.is_disabled) {

      
        for(let staff of staff_list){

          let get_working_day = [];
          
          if (staff.staffDetailFormatted != null) {
            
            get_working_day = staff.staffDetailFormatted.filter( data => data.dayId == created_date.getDay())
          }

          if (get_working_day.length > 0) { is_date_disabled = false; }

        }

        current_date.is_disabled = is_date_disabled;
        
      }
      
    }
  }

  async getWeeklyDaysOff() {
    
    let all_staff = await this.dataService.getStaffList();
    let days_number = await this.dataService.DAYS_OFF_NUMBER;

    let days_off = [];

    for(let value of days_number){

      let day_num = value-1;
      let is_day_off = false;

      for (let index in all_staff) {

        let is_day_working = [];
        
        if (all_staff[index].staffDetailFormatted != null) {
          is_day_working = all_staff[index].staffDetailFormatted.filter( data => data.dayId == day_num);
        }
        

        if (is_day_working.length > 0) { is_day_off = true; }
      }

      if (!is_day_off) { days_off.push(day_num)  }
    }

    this.options.disableWeeks = days_off;

  }


  async ionViewWillLeave () {
    
    this.IS_CALNDER_OPEN = false;
    this.modalController.dismiss();
  }

  async getStaffBookingList (){

    (await this.apiData.getStaffBookingList()).subscribe(
      (response: any) => {
        
        if (response.length >  0) {

          this.dataService.setStaffBookingList(response)
        }
      },
      (error: any) => {
        alert(JSON.stringify(error))
      }
    );
  }

  async openPicker() {

    this.IS_CALNDER_OPEN = false;
    setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
    
  }

  async _onDateSelect(selected_date: any) {

    //console.log('selected_date-----' ,selected_date)
    this.DATE = selected_date;
    this.IS_CALNDER_OPEN = false;
    await this.modalController.dismiss();
    await this._getDayList();
  }
  
  async onDateSelect (selected_date: any){// not in use
    
    
    this.date = selected_date;
    this.IS_CALNDER_OPEN = false;
    this.modalController.dismiss();
    let [year , month , date] = this.date.split('-')

    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);
    await this.setNonWorkingDaysOff()

    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()] + " "+new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;
    this.slides.slideTo(new_date.getDate()-1,1000);//(index_number, speed_time)
    
    await this.checkAllShiftStatus(this.date);
  }

  async selectDateRangeSlider (day: any, is_disabled: any, month: any, year: any){ // ---not in use

    if (is_disabled) return;
    this.date = `${year}-${month}-${day < 10 ? '0'+day : day}`;
    

    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);
    await this.setNonWorkingDaysOff()
    
    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()]+ ' '+ new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;

    await this.checkAllShiftStatus(this.date);
  }

  async checkAllShiftStatus (date: any) { // not in use------------

    let all_shift = await this.dataService.getNewStaticShift(new Date(date).getDay());
    
    console.clear()
    

    let all_staff = await this.dataService.getStaffList();
    
    
    for (let shift of all_shift) {
      
      let check_date_time = new Date(`${date} ${shift.value}`);
      shift.staff_ids = [];
      
      for (let staff of all_staff){
 
        
        let staff_date_booking = await this.dataService.getStaffBookingDetailWithDate(staff.employee_id, date)
        staff_date_booking.sort(function (a, b) { return a.startTime.localeCompare(b.startTime); }); // sort array in ascending order
        
        let day_num = new Date(date).getDay();
        let is_selected_day_off = await staff.staffDetailFormatted.filter( data => data.dayId == day_num);
          
        let break_start_time = new Date(`${date}T${is_selected_day_off[0]['outOfOfficeFrom']}`)
        let break_end_time = new Date(`${date}T${is_selected_day_off[0]['outOfOfficeTo']}`)
        break_end_time.setMinutes(break_end_time.getMinutes() - 1);
        

        if (staff_date_booking.length > 0){

          for (let booking of staff_date_booking) {

            let start_date_time = new Date(booking.startTime);
            let end_date_time = new Date(booking.endTime)
            end_date_time = new Date(end_date_time.setMinutes(end_date_time.getMinutes() - 1))
  
            
  
            // if (check_date_time >= start_date_time && check_date_time <= end_date_time) shift.staff_ids.push(staff.id);
  
            if ((check_date_time >= start_date_time && check_date_time <= end_date_time) || (break_start_time <= check_date_time && break_end_time >= check_date_time)
            ) {
              
                shift.staff_ids.push(staff.id);
  
            }
          }
        } else {

          if (break_start_time <= check_date_time && break_end_time >= check_date_time){
              
                shift.staff_ids.push(staff.id);
  
            }
        }

        
       
      }

      shift.all_staff_id = [... new Set(shift.staff_ids)]
      shift.is_disabled = shift.all_staff_id.length == all_staff.length;
      
    }

    for(let index in all_shift) {

      if (<any>(new Date().getTime()) > (new Date(`${date} ${all_shift[index].value}`) )){

        all_shift[index].is_disabled = true
        
      }
    }

    this.MORNING_SHIFT = all_shift;
    return
  }

  async _selectTiming (id: number , is_disabled : any) {

    if (is_disabled) return ;

    console.log(id  ,is_disabled )

    if (this.DATE == '') {
      await this.apiService.presentAlert('Please select a available date');
      return
    }

    let selecetd_shift = await this.ALL_SHIFT.filter(data => data.id == id);
    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.date = this.DATE;
    get_booking_data.timing_id = selecetd_shift[0];

    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration; // Totao service time

    let starting_date_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);
    let ending_date_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);
    ending_date_time = new Date(ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration -1));

    let office_last_shift = new Date (`${this.DATE} ${this.ALL_SHIFT[this.ALL_SHIFT.length - 1].value}` );
    let office_closed_time = new Date(office_last_shift.setMinutes(office_last_shift.getMinutes() + 30));

    if (ending_date_time > office_closed_time) {

      await this.apiService.presentAlert('Sorry outside of business owner working days')
      return
    }

    for (let shift of this.ALL_SHIFT) shift.is_active = shift.id == id ? true : false;

    //for (let e_shift of this.EVENING_SHIFT) e_shift.is_active = e_shift.id == id ? true : false;

    await this.dataService.setBookingData(get_booking_data);
    console.log('selecetd_shift----' ,selecetd_shift[0].value);
    
    setTimeout(() => { this.router.navigate(['/select-staff-with-service-booking'] , { queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } }) }, 200);
    
    
  }

  async selectTiming (id: number , timing_type: any, is_disabled : any){ // Not in use-----------

    if (is_disabled) return ;

    if (this.date == '') {
      await this.apiService.presentAlert('Please select a available date');
      return
    }

    let selecetd_shift = await this.MORNING_SHIFT.filter(data => data.id == id);
    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.date = this.date;
    get_booking_data.timing_id = id;

    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration;

    let starting_date_time = new Date(`${this.date}T${selecetd_shift[0].value}`);
    let ending_date_time = new Date(`${this.date}T${selecetd_shift[0].value}`);
    ending_date_time = new Date(ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration -1));

    let office_last_shift = new Date (`${get_booking_data.date} ${this.MORNING_SHIFT[this.MORNING_SHIFT.length - 1].value}` );
    let office_closed_time = new Date(office_last_shift.setMinutes(office_last_shift.getMinutes() + 30));

    if (ending_date_time > office_closed_time) {

      await this.apiService.presentAlert('Sorry outside of business owner working days')
      return
    }
    
    
    for (let m_shift of this.MORNING_SHIFT) m_shift.is_active = m_shift.id == id ? true : false;

    //for (let e_shift of this.EVENING_SHIFT) e_shift.is_active = e_shift.id == id ? true : false;

    await this.dataService.setBookingData(get_booking_data)

    setTimeout(() => { this.router.navigate(['/select-staff-with-service-booking'] , { queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } }) }, 200);
    
  }

  navigation() {

    this.location.back();
  }
}
