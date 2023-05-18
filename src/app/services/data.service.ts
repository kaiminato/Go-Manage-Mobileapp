import { Injectable } from '@angular/core';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public BASE_URL: any = window.location.origin
  public MONTHS_NAME: any = [ 'January','February','March','April','May','June','July','August','September','October','November','December'];

  public MONTHS_VALUE: any = [ '01','02','03','04','05','06','07','08','09','10','11','12'];
  public DAYS_VALUES: any = [
                            { name: 'Monday'    , value: 1},
                            { name: 'Tuesday'   , value: 2} ,
                            { name: 'Wednesday' , value: 3},
                            { name: 'Thursday'  , value: 4},
                            { name: 'Friday'    , value: 5},
                            { name: 'Saturday'  , value: 6},
                            { name: 'Sunday'    , value: 7},
                          ];

  public DAYS_OFF_NUMBER: any = [ 1, 2, 3, 4, 5, 6, 7]; // ['monday, tuesday .... respectivly]
  public DAYS_NAME: any = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  public SHORT_DAYS_NAME: any = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public CURRENT_YEAR: number = new Date().getFullYear();
  public CURRENT_MONTH: number = new Date().getMonth() +1;
  public NO_OF_YEARS: number = 10;
  public MORNING_SHIFT: string = 'morning';
  public EVENING_SHIFT: string = 'evening';
  public BOOKING_KEY: string  = 'service_booking';
  public STAFF_LIST_KEY: string  = 'staff_list';
  public SERVICE_LIST_KEY: string  = 'service_list';
  public STAFF_BOOKING_LIST_KEY: string  = 'staff_booking_list';
  public OWNER_DATA_KEY: string  = 'owner_app_info';
  public ALL_SHIFT: any = [];
  public BOOKING_WITH_STAFF: Number = 1;
  public BOOKING_WITH_SERVICE: Number = 2;
  public BOOKING_INITIAL_DATA: any  = { staff_id: '', servises: [], date: '', timing_id:'', booking_type: ''}
  public VOUCHER_SEND_TYPE_ME: any = 1;
  public VOUCHER_SEND_TYPE_SOME_ELSE: any = 2;
  public VOUCHER_DATA_KEY: any = 'voucher_data';
  public LOGGED_IN_PREVIOUS_URL_KEY = 'previous_url';
  public BACKGROUND_COLOR: string = '#ffffff';
  public BUTTON_COLOR: string = '#047473';
  public TEXT_COLOR: string = '#ffffff';
  public APP_HOME_PAGE_ICON: string = this.imageService.LOGO;

  constructor(public imageService: ImageService,) { }

  async getMonths () {

    let month_list = [];
    for (let index in this.MONTHS_NAME) {
      month_list.push({text: this.MONTHS_NAME[index] , value: this.MONTHS_VALUE[index]});
    }

    return await month_list;
  }

  async getYears () {

    let year_list = [];

    for (let i = 1; i <= this.NO_OF_YEARS; i ++){
      year_list.push({text: this.CURRENT_YEAR+i , value: this.CURRENT_YEAR+i});
    }

    return await year_list

  }

  async getDays (month: any , year: any) {

    month = month.toString().length > 1 ? month : '0'+month

    let date = new Date();
    let firstDay = (new Date(parseInt(year), parseInt(month), 1)).getDate();
    let lastDay = (new Date(parseInt(year), parseInt(month) , 0)).getDate();

    let get_booking_values = await this.getInitialBookingdata();
    let staff_detail = await this.getStaffDetail(get_booking_values.staff_id)

    let days_list = [];

    for (let i = 1; i <= lastDay; i++){

      let new_date = new Date(`${year}-${month}-${ i < 10 ? '0'+i : i}`);

      var dayName = this.SHORT_DAYS_NAME[new_date.getDay()];

      let day_name = this.DAYS_NAME[new_date.getDay()];

      let select_day = this.DAYS_VALUES.filter( data => data.name == day_name);
      let current_date_id = select_day[0].value;
      let staff_available_date_id = [];

      if (staff_detail.length > 0){ // If selected staff find

        staff_available_date_id =   await staff_detail[0].staffDetailFormatted.filter(  data => data.dayId == current_date_id );
      }

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      let status = false;

      if (get_booking_values.booking_type == this.BOOKING_WITH_STAFF) { // when booking via staff

        status = new_date <= new Date(yesterday) || staff_available_date_id.length == 0? true : false;
      } else {

        status = new_date <= new Date(yesterday)
      }


      days_list.push({ day_number: i, is_disabled: status, is_active: false, month: month, year: year , day_name: dayName})
    }
    return await days_list;
  }

  async getNewStaticShift (day_number: any) {

    let staff_list = await this.getStaffList();
    let time_array = [];

    for (let staff of staff_list) {


      let get_working_day = staff.staffDetailFormatted.filter( data => data.dayId == day_number);

      if (get_working_day.length > 0) {

        time_array.push(get_working_day[0].startShiftTime)
        time_array.push(get_working_day[0].endShiftTime)
      }

    }

    time_array.sort(function (a, b) { return a.localeCompare(b); });

    if (time_array.length == 0) {

      return this.ALL_SHIFT = [];
    }

    this.ALL_SHIFT = [];

    let start_from = time_array[0];
    let end_to = time_array[time_array.length - 1];

    let current_date = await this.getCurrentDate()
    end_to  = new Date(`${current_date}T${end_to}`);

    end_to.setMinutes(end_to.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

    end_to = end_to.getHours() + ':' + (end_to.getMinutes() == 0 ? '00' : end_to.getMinutes())+":"+(end_to.getSeconds() == 0 ? '00': end_to.getSeconds())

    let data = await this.returnTimesInBetween(start_from , end_to)

    return this.ALL_SHIFT;
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

  async getStaticShift () {

    let staff_list = await this.getStaffList();
    let time_array = [];

    for (let staff of staff_list) {

      for (let staff_timing of staff.staffDetailFormatted) {

        time_array.push(staff_timing.startShiftTime)
        time_array.push(staff_timing.endShiftTime)
      }
    }


    time_array.sort(function (a, b) { return a.localeCompare(b); });

    if (time_array.length == 0) {

      return this.ALL_SHIFT = [];
    }

    this.ALL_SHIFT = [];

    let start_from = time_array[0];
    let end_to = time_array[time_array.length - 1];

    let current_date = await this.getCurrentDate()
    end_to  = new Date(`${current_date}T${end_to}`);

    end_to.setMinutes(end_to.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

    end_to = end_to.getHours() + ':' + (end_to.getMinutes() == 0 ? '00' : end_to.getMinutes())+":"+(end_to.getSeconds() == 0 ? '00': end_to.getSeconds())

    let data = await this.returnTimesInBetween(start_from , end_to)

    return this.ALL_SHIFT;
  }


  async getShift (date: string){


    let d = new Date(date);
    let day_name = this.DAYS_NAME[d.getDay()];

    let select_day = this.DAYS_VALUES.filter( data => data.name == day_name);

    let selected_day_id = select_day.length > 0 ? select_day[0].value : 0;

    this.ALL_SHIFT = [];
    let get_booking_values = await this.getInitialBookingdata();


    let staff_detail = await this.getStaffDetail(get_booking_values.staff_id)

    // if dayId is exist in the array
    let staff_available_date_id =   await staff_detail[0].staffDetailFormatted.filter(
                                      data => data.dayId == selected_day_id
                                    );

    if (staff_available_date_id.length == 0) {

      // If current day is off day then take first working day from  staffDetailFormatted array

      staff_available_date_id =   [await staff_detail[0].staffDetailFormatted[0]];
      //return [];
    }


    let first_start_time = staff_available_date_id[0]?.startShiftTime;
    let first_end_time = staff_available_date_id[0]?.outOfOfficeFrom;
    let second_start_time = staff_available_date_id[0]?.timeAwayTo;
    let second_end_time = staff_available_date_id[0]?.endShiftTime;

    second_end_time  = new Date(`${date}T${second_end_time}`);
    second_end_time.setMinutes(second_end_time.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

    second_end_time = second_end_time.getHours() + ':' + (second_end_time.getMinutes() == 0 ? '00' : second_end_time.getMinutes())+":"+(second_end_time.getSeconds() == 0 ? '00': second_end_time.getSeconds())



    if (first_end_time != null && second_start_time != null ) {

      await this.returnTimesInBetween(first_start_time , first_end_time);
      await this.returnTimesInBetween(second_start_time , second_end_time);
    } else {

      await this.returnTimesInBetween(first_start_time , second_end_time);
    }


    for(let index in this.ALL_SHIFT) {

      if (<any>(new Date().getTime()) > (new Date(`${date} ${this.ALL_SHIFT[index].value}`) )){

        this.ALL_SHIFT[index].is_disabled = true

      }
    }


    return await this.ALL_SHIFT;
    // return await [
    //   { id:1, time: '08:30 AM', value:'08:30:00', shift_type: this.MORNING_SHIFT, is_active: false , is_disabled: false},
    //   { id:2, time: '09:00 AM', value:'09:00:00', shift_type: this.MORNING_SHIFT, is_active: false , is_disabled: false },
    //   { id:3, time: '09:30 AM', value:'09:30:00', shift_type: this.MORNING_SHIFT, is_active: false , is_disabled: false },
    //   { id:4, time: '10:00 AM', value:'10:00:00', shift_type: this.MORNING_SHIFT, is_active: false , is_disabled: false },
    //   { id:5, time: '10:30 AM', value:'10:30:00', shift_type: this.MORNING_SHIFT, is_active: false , is_disabled: false },
    //   { id:6, time: '11:00 AM', value:'11:00:00', shift_type: this.MORNING_SHIFT, is_active: false , is_disabled: false },
    //   { id:7, time: '05:30 PM', value:'17:30:00', shift_type: this.EVENING_SHIFT, is_active: false , is_disabled: false },
    //   { id:8, time: '06:00 PM', value:'18:00:00', shift_type: this.EVENING_SHIFT, is_active: false , is_disabled: false },
    //   { id:9, time: '06:30 PM', value:'18:30:00', shift_type: this.EVENING_SHIFT, is_active: false , is_disabled: false },
    //   { id:10, time: '07:00 PM', value:'19:00:00', shift_type: this.EVENING_SHIFT, is_active: false , is_disabled: false },
    //   { id:11, time: '07:30 PM', value:'19:30:00', shift_type: this.EVENING_SHIFT, is_active: false , is_disabled: false },
    //   { id:12, time: '08:00 PM', value:'20:00:00', shift_type: this.EVENING_SHIFT, is_active: false  , is_disabled: false},

    // ];
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


    return await timesInBetween.map(data => this.getGenTime(data));
  }


  async getGenTime (timeString: any)  {

    let value = timeString;
    let H = +timeString.substr(0, 2);
    let h = (H % 12) || 12;
    let ampm = H < 12 ? " AM" : " PM";
    timeString = h + timeString.substr(2, 3) + ampm;
    let data = {
                  id: this.ALL_SHIFT.length + 1 ,
                  time: timeString ,
                  shift_type: this.MORNING_SHIFT ,
                  value: value,
                  is_active: false,
                  is_disabled: false,
                  soft_disabled: false
                };
    this.ALL_SHIFT.push(data);

    return await data

  }

  async isDateOff (date_value: any) {

    let booking_data = await this.getInitialBookingdata();
      let staff_detail = await this.getStaffDetail(booking_data.staff_id);

      let d = new Date(date_value);
      let day_name = this.DAYS_NAME[d.getDay()];

      let select_day = this.DAYS_VALUES.filter( data => data.name == day_name);
      let current_date_id = select_day[0].value;

      let staff_available_date_id =   await staff_detail[0].staffDetailFormatted.filter(
        data => data.dayId == current_date_id
      );

      return await staff_available_date_id.length == 0 ? true : false;
  }

  async isStaffDateOff (date_value: any , staff_id: any) {

      let staff_detail = await this.getStaffDetail(staff_id);

      let d = new Date(date_value);
      let day_name = this.DAYS_NAME[d.getDay()];

      let select_day = this.DAYS_VALUES.filter( data => data.name == day_name);
      let current_date_id = select_day[0].value;

      let staff_available_date_id =   await staff_detail[0].staffDetailFormatted.filter(
        data => data.dayId == current_date_id
      );

      return await staff_available_date_id.length == 0 ? true : false;
  }

  async _setOwnerData(data: any) {

    return localStorage.setItem(this.OWNER_DATA_KEY ,  JSON.stringify(data));
  }

  async _getOwnerData () {

    let owner_data = await localStorage.getItem(this.OWNER_DATA_KEY);
    return await owner_data == undefined || owner_data == null ? [] :  JSON.parse(owner_data);
  }

  async _getOwnerColor() {

    let owner_data = await localStorage.getItem(this.OWNER_DATA_KEY);



    if (owner_data == undefined || owner_data == null) {

      return false

    } else {

      owner_data = JSON.parse(owner_data)

      this.BACKGROUND_COLOR = owner_data['colour_primary'] != '' ? owner_data['colour_primary'] : this.BACKGROUND_COLOR;
      this.BUTTON_COLOR = owner_data['colour_secondary'] != '' ? owner_data['colour_secondary'] : this.BUTTON_COLOR;
      this.TEXT_COLOR = owner_data['colour_text'] != '' ? owner_data['colour_text'] : this.TEXT_COLOR;
      // this.APP_HOME_PAGE_ICON = owner_data['logo'] != '' ? owner_data['logo'] : this.APP_HOME_PAGE_ICON;

    }

    return true
  }

  async setStaffList (data: any) {

    return await localStorage.setItem(this.STAFF_LIST_KEY, JSON.stringify(data));
  }

  async setServiceList (data: any) {

    return await localStorage.setItem(this.SERVICE_LIST_KEY, JSON.stringify(data));
  }

  async setStaffBookingList (data: any) {

    return await localStorage.setItem(this.STAFF_BOOKING_LIST_KEY, JSON.stringify(data));
  }

  async getStaffList () {

    let staff_list = await localStorage.getItem(this.STAFF_LIST_KEY);
    return await staff_list == undefined || staff_list == null ? [] :  JSON.parse(staff_list);
  }

  async getStaffDetail (staff_id: any) {

    let staff_list: any = await localStorage.getItem(this.STAFF_LIST_KEY);
    staff_list = staff_list == undefined || staff_list == null ? [] :  JSON.parse(staff_list);

   return await staff_list.filter( data => data.employee_id == staff_id);
  }

  async getServiceList () {

    let service_list = await localStorage.getItem(this.SERVICE_LIST_KEY);
    return await service_list == undefined || service_list == null ? [] :  JSON.parse(service_list);
  }

  async getStaffBookingList () {

    let booking_list = await localStorage.getItem(this.STAFF_BOOKING_LIST_KEY);
    return await booking_list == undefined || booking_list == null ? [] :  JSON.parse(booking_list);
  }

  async getStaffBookingDetail (staff_id: any) {

    let staff_booking_list: any = await localStorage.getItem(this.STAFF_BOOKING_LIST_KEY);
    staff_booking_list = staff_booking_list == undefined || staff_booking_list == null ? [] :  JSON.parse(staff_booking_list);

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

   return await staff_booking_list.filter( data => data.employeeId == staff_id && (new Date(yesterday) < new Date(data.endTime)));
  }

  async getStaffBookingDetailWithDate (staff_id: any, date: any) {

    let staff_list: any = await localStorage.getItem(this.STAFF_BOOKING_LIST_KEY);
    staff_list = staff_list == undefined || staff_list == null ? [] :  JSON.parse(staff_list);



   return await staff_list.filter( data => data.employeeId == staff_id && data.startTime.includes(date));
  }



  async setInitialBooking(data: any) {

    return await localStorage.setItem(this.BOOKING_KEY, JSON.stringify(data))
  }

  async getInitialBookingdata(){

    let data = await localStorage.getItem(this.BOOKING_KEY);
    return await data == undefined ? '' : JSON.parse(data);
  }

  async resetDateTimeInitialBookingData (data: any) {

    return await localStorage.setItem(this.BOOKING_KEY, JSON.stringify(data))
  }

  async setSelectedServicesInBooking (selected_services_list : []) {

    let data = await this.getInitialBookingdata();

    if (data != '') {

      data.servises = selected_services_list;
      return await localStorage.setItem(this.BOOKING_KEY, JSON.stringify(data))
    }
    return
  }

  async setBookingData (data: any){

    return await localStorage.setItem(this.BOOKING_KEY, JSON.stringify(data))
  }

  async removeBookingdata () {
    return await localStorage.removeItem(this.BOOKING_KEY)
  }

  async  setVoucherData ( data : any) {

    return await localStorage.setItem(this.VOUCHER_DATA_KEY , JSON.stringify(data))
  }

  async  getVoucherData ( ) {

    let voucher_data: any = await localStorage.getItem(this.VOUCHER_DATA_KEY);
    return await  voucher_data == undefined || voucher_data == null ? {} :  JSON.parse(voucher_data);

  }

  async removeVoucherData () {

    return await localStorage.removeItem(this.VOUCHER_DATA_KEY)
  }

  async setPreviousUrl (url: string) {

      return await localStorage.setItem(this.LOGGED_IN_PREVIOUS_URL_KEY , url)
  }

  async getPreviousUrl () {

    let previous_url: any = await localStorage.getItem(this.LOGGED_IN_PREVIOUS_URL_KEY);
    return await  previous_url == undefined || previous_url == null ? '' :  previous_url;
}

  async removePreviousUrl () {

    return await localStorage.removeItem(this.LOGGED_IN_PREVIOUS_URL_KEY)
  }

}
