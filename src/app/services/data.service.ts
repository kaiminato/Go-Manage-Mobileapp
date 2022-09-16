import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public MONTHS_NAME: any = [ 'January','February','March','April','May','June','July','August','September','October','November','December'];
  public MONTHS_VALUE: any = [ '01','02','03','04','05','06','07','08','09','10','11','12'];
  public CURRENT_YEAR: number = new Date().getFullYear();
  public CURRENT_MONTH: number = new Date().getMonth() +1;
  public NO_OF_YEARS: number = 10;
  public MORNING_SHIFT: string = 'morning';
  public EVENING_SHIFT: string = 'evening';
  public BOOKING_KEY: string  = 'service_booking';
  public STAFF_LIST_KEY: string  = 'staff_list';
  public SERVICE_LIST_KEY: string  = 'service_list';
  public STAFF_BOOKING_LIST_KEY: string  = 'staff_booking_list';
  public ALL_SHIFT: any = [];
  constructor() { }

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

    let days_list = [];

    for (let i = 1; i <= lastDay; i++){

      let new_date = new Date(`${year}-${month}-${ i < 10 ? '0'+i : i}`);
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let status = new_date <= new Date(yesterday);
      console.log(month)

      days_list.push({ day_number: i, is_disabled: status, is_active: false, month: month, year: year})
    }
    console.log('days_list---',days_list)
    return await days_list;
  }

  async getShift (){

    this.ALL_SHIFT = [];
    let get_booking_values = await this.getInitialBookingdata();
    

    let staff_detail = await this.getStaffDetail(get_booking_values.staff_id)

    let first_start_time = staff_detail[0]?.startShiftTime;
    let first_end_time = staff_detail[0]?.outOfOfficeFrom;
    let second_start_time = staff_detail[0]?.outOfOfficeTo;
    let second_end_time = staff_detail[0]?.endShiftTime;

    await this.returnTimesInBetween(first_start_time , first_end_time);
    await this.returnTimesInBetween(second_start_time , second_end_time);
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
    
    console.log('time start', start ,'time end', end);

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
    let data = {id: this.ALL_SHIFT.length + 1 ,time: timeString , shift_type: this.MORNING_SHIFT ,  value: value, is_active: false, is_disabled: false};
    this.ALL_SHIFT.push(data);
    
    return await data
     
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

   return await staff_list.filter( data => data.id == staff_id);
  }

  async getServiceList () {

    let service_list = await localStorage.getItem(this.SERVICE_LIST_KEY);
    return await service_list == undefined || service_list == null ? [] :  JSON.parse(service_list);
  }

  async getStaffBookingList () {

    let service_list = await localStorage.getItem(this.STAFF_BOOKING_LIST_KEY);
    return await service_list == undefined || service_list == null ? [] :  JSON.parse(service_list);
  }

  async getStaffBookingDetail (staff_id: any) {

    let staff_list: any = await localStorage.getItem(this.STAFF_BOOKING_LIST_KEY);
    staff_list = staff_list == undefined || staff_list == null ? [] :  JSON.parse(staff_list);

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

   return await staff_list.filter( data => data.employeeId == staff_id && (new Date(yesterday) < new Date(data.endTime)));
  }

  async setInitialBooking(id: any) {

    let data = {
      staff_id: id,
      servises: [],
      date: '',
      timing_id:''
    }

    return await localStorage.setItem(this.BOOKING_KEY, JSON.stringify(data))
  }

  async getInitialBookingdata(){
    
    let data = await localStorage.getItem(this.BOOKING_KEY);
    return await data == undefined ? '' : JSON.parse(data);
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
 
}
