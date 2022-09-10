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

  async getDays (month: number , year: number) {

    let date = new Date();
    let firstDay = (new Date(year, month, 1)).getDate();
    let lastDay = (new Date(year, month + 1, 0)).getDate();

    let days_list = [];

    for (let i = 1; i <= lastDay; i++){

      days_list.push({ day_number: i})
    }

    return await days_list;
  }

  async getShift (){

    return await [
      { id:1, time: '08:30 AM', shift_type: this.MORNING_SHIFT, is_active: false },
      { id:2, time: '09:00 AM', shift_type: this.MORNING_SHIFT, is_active: true },
      { id:3, time: '09:30 AM', shift_type: this.MORNING_SHIFT, is_active: false },
      { id:4, time: '10:00 AM', shift_type: this.MORNING_SHIFT, is_active: false },
      { id:5, time: '10:30 AM', shift_type: this.MORNING_SHIFT, is_active: false },
      { id:6, time: '11:00 AM', shift_type: this.MORNING_SHIFT, is_active: false },
      { id:7, time: '05:30 PM', shift_type: this.EVENING_SHIFT, is_active: false },
      { id:8, time: '06:00 PM', shift_type: this.EVENING_SHIFT, is_active: false },
      { id:9, time: '06:30 PM', shift_type: this.EVENING_SHIFT, is_active: false },
      { id:10, time: '07:00 PM', shift_type: this.EVENING_SHIFT, is_active: false },
      { id:11, time: '07:30 PM', shift_type: this.EVENING_SHIFT, is_active: false },
      { id:12, time: '08:00 PM', shift_type: this.EVENING_SHIFT, is_active: false },
      
    ];
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

   return await staff_list.filter( data => data.employeeId == staff_id && (new Date() < new Date(data.endTime)));
  }

  async setInitialBooking(id: any) {

    let data = {
      staff_id: id,
      servises: [],
      date: ''
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
 
}
