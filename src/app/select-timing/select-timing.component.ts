import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PickerController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';
import { IonModal } from '@ionic/angular';
import { ApiDataService } from '../services/api-data.service';
import { ModalController } from '@ionic/angular';
import { AuthService } from '@auth0/auth0-angular';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-select-timing',
  templateUrl: './select-timing.component.html',
  styleUrls: ['./select-timing.component.scss'],
})

export class SelectTimingComponent implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  isVisible: boolean = false;
  ID: any = '';
  HEADING: string = "3";
  TOTAL_DURATION: any = 0;
  STARTING_TIME: string;
  ENDING_TIME: string;
  STUDIO_NAME: string = '';
  SERVICE_NAME: string = '';
  TOTAL_AMOUNT: any = 0;
  TIME_ID: any = 0;
  CURRENT_MONTH: number = this.dataService.CURRENT_MONTH;
  CURRENT_YEAR: number = this.dataService.CURRENT_YEAR;
  CURRENT_MONTH_VALUE: string = '';
  DAYS_ARRAY: any = [];
  ALL_SHIFT: any = [];
  CANCEL_BOOKING_ID: number = 0;
  IS_CALNDER_OPEN: boolean = false;
  IS_CONFIRM_OPEN: boolean = false;
  SELECT_STAFF_OPEN : boolean = false;
  DATE: string = '';
  DATE_TYPE: 'object';
  STAFF_BOOKING_LIST: any = [];
  MONTH_NAME_LIST: any = [];
  IS_LOGIN: boolean = false;
  BOOKING_WITH_STAFF: any = true;
  PENDING_BOOKING_TIMEOUT: any;
  ALL_AVAILABLE_SLOT : any = [];
  STAFF_AVAILABLE_SLOT: any = [];
  SELECT_STAFF_ID: any;
  STAFF_LIST: any = [];
  AVAILABLE_STAFF_LIST: any = [];
  DISPLAY_LIST: any = [];
  slideOpts = {
    slidesPerView: 6,
    initialSlide: 10,
    speed: 400,
    loop: false,
  };

  options: CalendarModalOptions = {
    daysConfig: [
    ]
  };

  markDisabled: any = (date: Date) => {
    var current = new Date();
    return date < current;
  };
  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    public dataService: DataService,
    public apiService: ApiDataService,
    private modalController: ModalController,
    public auth: AuthService,
    private apiData: ApiDataService,
    public imageService: ImageService,
  ) {
    let booking_data =  this.dataService.getInitialBookingdata();
    //console.log("booking_data",booking_data);
    this.SELECT_STAFF_ID = booking_data?.staff_id;
    this.apiData.presentLoading();
    this.getAllAvailableSlots();
    this.getAllAvailableSlotsByEmployee(booking_data?.staff_id);
    this.DATE = this.getCurrentDate();
    setTimeout(() => {
      this._getNewDisabledDate();
      this._getNewShiftList();
      this._getDisplayList();
      this.isVisible = true;
      this.apiData.dismiss();
    }, 2000);
    this._getStaffBookingList();
  }



  async _datePickerClosed() {

    this.IS_CALNDER_OPEN = false;
  }
  ngOnInit() { 
    const buttonColor = this.dataService.BUTTON_COLOR;
    if (buttonColor) {
      document.documentElement.style.setProperty('--button-color', buttonColor);
    } else {
      console.error('Button color is not defined'); // This will help you know if BUTTON_COLOR is undefined
    }
  }
 
  async ionViewWillEnter() {

    this.activateRoute.queryParams
      .subscribe(params => {
        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
      }
      );

    this.STAFF_LIST = [];

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH] + " " + this.CURRENT_YEAR

    let booking_data = await this.dataService.getInitialBookingdata();
    this.DAYS_ARRAY = await this._getDaysByYear(this.CURRENT_YEAR);
    this.STAFF_BOOKING_LIST = await this.dataService.getStaffBookingDetail(booking_data?.staff_id);
    this.SELECT_STAFF_ID = booking_data?.staff_id;
    this.getStaffList();
    await this.checkLogin();
    if (booking_data.date != '') {
      await this._preFilledData();
    } else {
      this.IS_CALNDER_OPEN = true;
    }

    let response = await this.dataService.getSelectTimingInfo();
    if (response["flag"] == "true") {
      booking_data.date = response["selectedDate"]
      booking_data.timing_id = response["selectedTime"]

      this.TIME_ID = response["selectedTimingId"]
      this.dataService.saveSelectTimingInfo("false", "", "", "")
      this.DATE = response["selectedDate"];
      this.SERVICE_NAME = booking_data.servises[0].serviceName;
      this.IS_CALNDER_OPEN = false;
      this.IS_CONFIRM_OPEN = true;
      //await this._getDayList();
      this.BOOKING_WITH_STAFF =
        booking_data.booking_type == this.dataService.BOOKING_WITH_STAFF
          ? true
          : false;

      booking_data.staff_details = await this.dataService.getStaffDetail(
        booking_data.staff_id
      );
      let shift_timing_details = await this.dataService.getShift(
        booking_data.date
      );
      booking_data.shift_timing_details =
        await shift_timing_details.filter(
          (data) => data.id == booking_data.timing_id.id
        );

      let time = response["selectedTime"].split(',')[1];
    
      let [start_time, am_pm] = time.split('"')[3].split(' ');

      this.STARTING_TIME = `${start_time}${am_pm}`;
      for (let service of booking_data.servises) {
        this.TOTAL_DURATION += service.serviceDuration;
        this.TOTAL_AMOUNT += service.servicePrice;
      }

      let owner_details = await this.dataService._getOwnerData();
      this.STUDIO_NAME = owner_details != '' ? owner_details['site_name'] + " " + owner_details['businessAddress'] : '';

      let [year, month, day] = booking_data.date.split('-');
      let new_date = new Date(booking_data.date);
      let get_month_name = await this.dataService.MONTHS_NAME[new_date.getMonth()];

      this.DATE = `${day} ${get_month_name} ${year}`;

      let endtime = response["selectedTime"].split(',')[2];
      
      let end_time = endtime.split('"')[3];
      var now = new Date(`${booking_data.date}T${end_time}:00`);
      now.setMinutes(now.getMinutes() + this.TOTAL_DURATION); // timestamp
      now = new Date(now); // Date object
      let { without_space_time } = await this.formatAMPM(now);
      this.ENDING_TIME = without_space_time;
      this._onDateSelect(response["selectedDate"])
    }


  }

  async _getStaffBookingList() {

    (await this.apiData.getStaffBookingList()).subscribe(
      (response: any) => {
        this.dataService.setStaffBookingList(response);
        this.STAFF_BOOKING_LIST = response;
      },
      (error: any) => {
        alert(JSON.stringify(error))
      }
    );
  }

  
  async getAllAvailableSlots() {
    (await this.apiData.getAllAvailableSlots()).subscribe(
      (response: any) => {
        this.ALL_AVAILABLE_SLOT = response;
      },
      (error: any) => {
        alert(JSON.stringify(error))
      }
    );
  }

  async getAllAvailableSlotsByEmployee(employeeId: any) {

    (await this.apiData.getAllAvailableSlotsByEmployee(employeeId)).subscribe(
      (response: any) => {
        this.STAFF_AVAILABLE_SLOT = response;
      },
      (error: any) => {
        alert(JSON.stringify(error))
      }
    );
   
  }

  async getStaffList() {
    await (await this.apiData.getStaffList()).subscribe(
      async (response: any) => {
        if (response.length > 0) {
          this.STAFF_LIST = response;
          await this.dataService.setStaffList(response)
        }
      },
      async (error: any) => {
        alert(JSON.stringify(error));
      }
    );
  }

  async ionViewWillLeave() {

    this.IS_CALNDER_OPEN = false;
    await this.modalController.dismiss();
  }

  async formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let str_time = hours + ':' + minutes + ' ' + ampm;
    let str_time_without_space = hours + ':' + minutes + ampm;

    return await {
      with_space_time: str_time,
      without_space_time: str_time_without_space,
    };
  }

  async _preFilledData() {

    this.IS_CALNDER_OPEN = false;
    let booking_data = await this.dataService.getInitialBookingdata();

    this.DATE = booking_data.date;

    if(this.ALL_SHIFT.length == 0) return;
    if (booking_data.timing_id != '') {

      setTimeout(() => {
        this.ALL_SHIFT[booking_data.timing_id.id - 1].is_active = true;
      }, 300);
    }
  }
  // async _selectOtherStaff(selected_date: any, id: number, selected_time: any) {
  //   this.AVAILABLE_STAFF_LIST = [];
  //   this.SELECT_STAFF_OPEN = true;
  //   const formatted_time = this.formatTime(selected_time);

  //   for (let staff of this.STAFF_LIST) {
  //       if (staff.staffDetailFormatted) {
  //           (await this.apiData.getAllAvailableSlotsByEmployee(staff.employee_id)).subscribe(
  //             (response: any) => {
               
  //               for (let i = 0; i < response.length; i++) {
  //                 if (response[i].workDate == selected_date) {
  //                     for (let j = 0; j < response[i].availableSlots.length; j++) {
  //                         if (response[i].availableSlots[j] == formatted_time) {
  //                             this.AVAILABLE_STAFF_LIST.push(staff);
  //                         }
  //                     }
  //                 }
  //             }
  //             },
  //             (error: any) => {
  //               alert(JSON.stringify(error))
  //             }
  //           );
  //       }
  //   }
  // }

  formatTime(selected_time: string): string {
    // Convert 12-hour format to 24-hour format
    const [timePart, modifier] = selected_time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) {
        hours += 12; // Convert to 24-hour format
    } else if (modifier === 'AM' && hours === 12) {
        hours = 0; // Midnight case
    }

    // Construct the final time string in "HH:mm:ss" format
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }
  async _selectTiming(selected_date:any, id: number, is_disabled: any) {

    this.DATE = selected_date;

    if (is_disabled) return;

    let selected_shift_list = this.DISPLAY_LIST.filter(data => data.DATE == selected_date);
    let selecetd_shift = (selected_shift_list[0].shift_list).filter(data => data.id == id);

    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.date = this.DATE;
    get_booking_data.timing_id = selecetd_shift[0];

    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration;

    let starting_date_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);
    let ending_date_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);
    ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration - 1)
    ending_date_time = new Date(ending_date_time);

    let pen_book_end_time = new Date(`${this.DATE}T${selecetd_shift[0].value}`);
    pen_book_end_time.setMinutes(pen_book_end_time.getMinutes() + total_duration)
    pen_book_end_time = new Date(pen_book_end_time);
    pen_book_end_time = <any>await this.returnDateTimeFormat(pen_book_end_time);

    let create_pending_booking_start_time = await this.returnDateTimeFormat(starting_date_time);
    let create_pending_booking_end_time = await this.returnDateTimeFormat(ending_date_time);

    // Check services's time is under office timing

    let office_last_shift = new Date(`${get_booking_data.date} ${selected_shift_list[0].shift_list[selected_shift_list[0].shift_list.length - 1].value}`);
    let office_closed_time = new Date(office_last_shift.setMinutes(office_last_shift.getMinutes() + 30));

    if (ending_date_time > office_closed_time) {

      await this.apiService.presentAlert('Sorry outside of business owner working days')
      return
    }

    if (!this.IS_LOGIN) {
      await this.dataService.saveSelectTimingInfo("true", this.DATE, JSON.stringify(get_booking_data.timing_id), String(id));

      this.auth.loginWithRedirect({
        appState: { target: '/select-a-time' }
      })
      return
    } else {
      await this.dataService.saveSelectTimingInfo("false", this.DATE, String(id), String(id));
    }


    await this.apiData.presentLoading();

    this.auth.getUser().subscribe(
      async (response: any) => {
        let userEmail;
        if (response.hasOwnProperty('email')) {
          userEmail = response.email;
        }
        else {
          const altEmail = await this.dataService._getUserEmail();
          if (altEmail) {
            userEmail = altEmail;
          }
          else {
            setTimeout(() => { this.router.navigate(['/profile']); }, 200);
            return;
          }
        }
        (await this.apiData.getMyProfile(userEmail)).subscribe(
          async (user_info: any) => {
            let data = {
              "userId": user_info.userGMID,
              "staffId": get_booking_data.staff_id,
              "isPending": 1,
              "startTime": create_pending_booking_start_time,
              "endTime": pen_book_end_time,
              "serviceId": get_booking_data.servises[0].id
            };

            (await this.apiData.createPendingAppointment(data)).subscribe(
              async () => {
                await this.apiData.dismiss();
              },
              async (error: any) => {
                await this.apiData.dismiss();
                if (error.status == 200) {
                  await this.dataService.setBookingData(get_booking_data);
                  setTimeout(() => { this.router.navigate(['/booking-summary',this.SELECT_STAFF_ID], { queryParams: this.CANCEL_BOOKING_ID == 0 ? {} : { id: this.CANCEL_BOOKING_ID } }); }, 200);
                } else if (error.status == 201) {
                  await this.apiData.presentAlert('pending booking server error' + JSON.stringify(error));
                  return;
                } else if (error.status == 500) {
                  await this.dataService.setBookingData(get_booking_data);
                  setTimeout(() => { this.router.navigate(['/booking-summary', this.SELECT_STAFF_ID], { queryParams: this.CANCEL_BOOKING_ID == 0 ? {} : { id: this.CANCEL_BOOKING_ID } }); }, 200);
                } else {
                  await this.apiData.presentAlert('pending booking server error' + JSON.stringify(error));
                }
              }
            );
          },

          async (error: any) => {
            await this.apiData.dismiss();
            await this.apiData.presentAlert('user profile error' + JSON.stringify(error));
          }
        );

      },
      async (error: any) => {
        await this.apiData.dismiss();
        await this.apiData.presentAlert('auth api error' + JSON.stringify(error));
      }
    );
  }

  getMonthFromDayIndex(dayIndex, year) {
    var date = new Date(year, 0);
    date.setDate(dayIndex);

    return date.getMonth() + 1;
  }

  async _getDayList() {
    let today_date = new Date(this.DATE);
    let year: any = today_date.getFullYear();
    let month: any = today_date.getMonth() + 1;
    // let day_list = await this._getDays(month , year);
    let day_list = await this._getDaysByYear(year);
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[today_date.getMonth()] + " " + year;
    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_availability_dates = [];

    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {
        var yesterday = new Date();
        yesterday.setHours(0, 0, 0);
        staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter(data => data.description == '' && (new Date(data.workDate)).getTime() >= (new Date(yesterday.getDate())).getTime())
      }
    }
    for (let value of day_list) {

      let is_date_working = await staff_availability_dates.filter(data => data.workDate == value.full_date);
      if (is_date_working.length == 0) { // if rota not exist according for date
        value.is_disabled = true  
      } else {
        let is_all_shift_booked = (await this._isDateDisabled(value.full_date)).filter(data => !data.is_disabled); // Check is all shift of date is booked or not
        if (is_all_shift_booked.length == 0){ value.is_disabled = true; }// If all shift of date is booked
      }

      value.is_active = value.full_date == this.DATE ? true : false;
    }

    this.DAYS_ARRAY = day_list;

    let active_index_array = await day_list.filter(data => data.is_active);
    let active_index = active_index_array.length > 0 ? active_index_array[0].day_number : 0;
    let active_index_array_index = day_list.indexOf(active_index_array[0]);
    // this.slides.slideTo(active_index_array_index, 1000);

    await this._getShiftList();
  }

  closeConfirm() {
    this.IS_CONFIRM_OPEN = false;
    for(let shift of this.ALL_SHIFT){
      if(shift.value == this.STARTING_TIME){
        shift.is_active = false;
      }
    }
  }

  confirmPresaved() {
    this.IS_CONFIRM_OPEN = false;
    this._selectTiming(this.DATE, this.TIME_ID, false);
  }

  async _getShiftList() {
    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_availability_dates = [];

    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {

        staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter(data => data.description == '' && data.workDate == this.DATE)

      }
    }
    let current_date_booking = await this.STAFF_BOOKING_LIST.filter(data => data.startTime.includes(this.DATE));
    let shift_start_time: any = '';
    let shift_end_time: any = ''

    if (staff_availability_dates.length > 0) {
   
      // get shift start time & end time
      if (staff_availability_dates.length > 1) {
        this.ALL_SHIFT = [];
        for (let value of staff_availability_dates) {
          shift_start_time = value?.startShiftTime;
          shift_end_time = value?.endShiftTime;
          if(shift_end_time != '00:00:00'){
            shift_end_time = new Date(`${this.DATE}T${shift_end_time}`);
            shift_end_time.setMinutes(shift_end_time.getMinutes() - 30);
            shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes()) + ":" + (shift_end_time.getSeconds() == 0 ? '00' : shift_end_time.getSeconds());
            this.ALL_SHIFT.push(...await this._returnTimesInBetween(shift_start_time, shift_end_time)) ;
          }
        }
        if(this.ALL_SHIFT == null || this.ALL_SHIFT.length == 0){
          shift_start_time = '00:00:00';
          const end_time = shift_end_time;
          shift_end_time = new Date(`${this.DATE}T${shift_end_time}`);
          shift_end_time.setMinutes(shift_end_time.getMinutes() - 30);
          shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes()) + ":" + (shift_end_time.getSeconds() == 0 ? '00' : shift_end_time.getSeconds());
          this.ALL_SHIFT = await this._returnTimesInBetween(shift_start_time, shift_end_time);
          if(end_time == '00:00:00'){
            for (let shift_value of this.ALL_SHIFT) {
              if (!shift_value.is_disabled) { // If shift is not disabled
                shift_value.is_disabled = true; 
              }
      
            }
          }
        }
      } else {
        shift_start_time = staff_availability_dates[0]?.startShiftTime;
        shift_end_time = staff_availability_dates[0]?.endShiftTime;
        const end_time = shift_end_time;
        shift_end_time = new Date(`${this.DATE}T${shift_end_time}`);
        shift_end_time.setMinutes(shift_end_time.getMinutes() - 30);
        shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes()) + ":" + (shift_end_time.getSeconds() == 0 ? '00' : shift_end_time.getSeconds());      
  
        this.ALL_SHIFT = await this._returnTimesInBetween(shift_start_time, shift_end_time);
        if(end_time == '00:00:00'){
          for (let shift_value of this.ALL_SHIFT) {
            if (!shift_value.is_disabled) { // If shift is not disabled
              shift_value.is_disabled = true; 
            }
    
          }
        }
      }

    
      

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
                shift_value.is_disabled = true; // Disabled the shift
              }

            }
          }
        }

      }

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
      total_shift_will_count = booking_total_duration == 0 ? ~~(booking_total_duration / 30) : (~~(booking_total_duration / 30) + 1)
      // Shift disabled based on current time
      for (let shift_value of this.ALL_SHIFT) {
        let shift__date_time = new Date(`${this.DATE}T${shift_value.value}:00`);
        const current_date_time = new Date();
        if (current_date_time.getMonth() == shift__date_time.getMonth() && current_date_time.getDate() == shift__date_time.getDate() && shift__date_time.getTime() < current_date_time.getTime()) {
          shift_value.is_disabled = true; // Disabled the shift
        }
      }

      // Set Soft disabled
      if (total_shift_will_count != 1) {
        let last_index = 0;
        let neighbour_difference = 0;
        for (let index in this.ALL_SHIFT) {

          let checked_pass = true;

          if (this.ALL_SHIFT[index]['is_disabled'] == false) {

            for (let i = 1; i < total_shift_will_count; i++) {

              let num = Number(index) + i;


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
            }
          }
          else{
            neighbour_difference = Number(index) - last_index;
            if(neighbour_difference <= total_shift_will_count){
              for (let i = last_index + 1; i < Number(index); i++) {
                this.ALL_SHIFT[i]['is_disabled'] = true;
              }
            }
            last_index = Number(index);
          }
        }
      }
    } else {

      return
    }
    return

  }

  async _getNewShiftList(){
    let current_date_available_slots = await this.STAFF_AVAILABLE_SLOT.filter(data => data.workDate == this.DATE);
    if(current_date_available_slots == undefined || current_date_available_slots.length == 0) return;
    this.ALL_SHIFT = await this._returnShiftTimes(current_date_available_slots[0].availableSlots);
    for (let shift_value of this.ALL_SHIFT) {
      let shift__date_time = new Date(`${this.DATE}T${shift_value.value}:00`);
      const current_date_time = new Date();
      if (current_date_time.getMonth() == shift__date_time.getMonth() && current_date_time.getDate() == shift__date_time.getDate() && shift__date_time.getTime() < current_date_time.getTime()) {
        shift_value.is_disabled = true; // Disabled the shift
      }
    }
    this._isDisabledBasedServicesDuration();
  }

  async _isDisabledBasedServicesDuration(){
    if (this.STAFF_AVAILABLE_SLOT.length > 0) {
   
      // Shift disabled based on Booking time -- end
      let booking_data = await this.dataService.getInitialBookingdata();
      let booking_total_duration = 0;
      let total_shift_will_count = 1;

      for (let value of booking_data.servises) booking_total_duration += value.serviceDuration;

      booking_total_duration = booking_total_duration - 1;
      total_shift_will_count = booking_total_duration == 0 ? ~~(booking_total_duration / 5) : (~~(booking_total_duration / 5) + 1);
      // Set Soft disabled
      if (total_shift_will_count != 1) {
        let last_index = 0;
        let neighbour_difference = 0;
        for (let index in this.ALL_SHIFT) {

          let checked_pass = true;

          if (this.ALL_SHIFT[index]['is_disabled'] == false) {

            for (let i = 1; i < total_shift_will_count; i++) {

              let num = Number(index) + i;


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
            }
          }
          else{
            neighbour_difference = Number(index) - last_index;
            if(neighbour_difference <= total_shift_will_count){
              for (let i = last_index + 1; i < Number(index); i++) {
                this.ALL_SHIFT[i]['is_disabled'] = true;
              }
            }
            last_index = Number(index);
          }
        }
      }
    } else {

      return
    }
    return

  }

  async _getDays(month: any, year: any) {

    month = month.toString().length > 1 ? month : '0' + month

    let date = new Date();
    let firstDay = (new Date(parseInt(year), parseInt(month), 1)).getDate();
    let lastDay = (new Date(parseInt(year), parseInt(month), 0)).getDate();

    let days_list = [];

    for (let i = 1; i <= lastDay; i++) {

      let new_date = new Date(`${year}-${month}-${i < 10 ? '0' + i : i}`);
      var dayName = this.dataService.SHORT_DAYS_NAME[new_date.getDay()];

      days_list.push({
        day_number: i < 10 ? '0' + i : i.toString(),
        is_disabled: false,
        is_active: false,
        month: month,
        year: year,
        day_name: dayName,
        full_date: year + '-' + month + '-' + (i < 10 ? '0' + i : i)
      })

    }
    return days_list;
  }
  async _getDaysByYear(year: any) {
    let days_list = [];

    for (let m = 0; m < 12; m++) {
      let month = (m + 1).toString().padStart(2, '0');
      let firstDay = (new Date(parseInt(year), m, 1)).getDate();
      let lastDay = (new Date(parseInt(year), m + 1, 0)).getDate();

      for (let i = 1; i <= lastDay; i++) {
        let new_date = new Date(`${year}-${month}-${i.toString().padStart(2, '0')}`);
        let dayName = this.dataService.SHORT_DAYS_NAME[new_date.getDay()];

        days_list.push({
          day_number: i.toString().padStart(2, '0'),
          is_disabled: false,
          is_active: false,
          month: month,
          year: year,
          day_name: dayName,
          full_date: `${year}-${month}-${i.toString().padStart(2, '0')}`
        });
      }
    }

    return days_list;
  }


  async _selectDateRangeSlider(day: any, is_disabled: any, month: any, year: any, index: any) {
    if (is_disabled) return;
    this.DATE = `${year}-${month}-${day}`;

    for (let value of this.DAYS_ARRAY) value.is_active = false;
    this.DAYS_ARRAY[index]['is_active'] = true;
    // this.slides.slideTo(index - 1, 1000);
    await this._getShiftList();
  }
  async getDaysBySlideChange(nextMonth, nextYear) {
    this.DAYS_ARRAY = await this._getDays(nextMonth, nextYear);
    for (let value of this.DAYS_ARRAY) {
      value.is_active = false;
      value.is_disabled = true;
    }
    await this._getShiftList();
  }
 
  async _onDateSelect(selected_date: any) {
    this.DATE = selected_date;
    this.IS_CALNDER_OPEN = false;
    const desiredDateId = this.DATE;
    const element = document.getElementById(desiredDateId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    }

  }

  async _getDisabledDate() {
    let all_dates = await this._returnDateInBetween();

    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_rota = [];
    let current_date = await this.getCurrentDate();

    if (staff_detail[0].staffDetailFormatted != null) {

      if (staff_detail[0].staffDetailFormatted.length > 0) {

        // Get  staff rota
        staff_rota = await staff_detail[0].staffDetailFormatted.filter(data => data.description == '' && new Date(data.workDate) >= new Date(current_date))
      }
    }


    let daysConfig = [];
    for (let value of all_dates) {

      let is_date_working = await staff_rota.filter(data => data.workDate == value);
      let tempDay = new Date(value);
      let offset = tempDay.getTimezoneOffset()
      tempDay = new Date(tempDay.getTime() + (offset*60*1000))
      if (is_date_working.length == 0) { // If rota not found on current loop date
        daysConfig.push({ date: new Date(tempDay), disable: true });
      } else {
        let is_all_shift_booked = (await this._isDateDisabled(value)).filter(data => !data.is_disabled);
        if (is_all_shift_booked.length == 0) daysConfig.push({ date: new Date(tempDay), disable: true });

      }

    }
    this.options = { daysConfig: daysConfig } // Set Disabled Dates in Datepicker
  }

  async _getNewDisabledDate(){
    let booking_data = await this.dataService.getInitialBookingdata();
    let all_dates = await this._returnDateInBetween();
    let daysConfig = [];
    for (let value of all_dates) {
      let is_date_working =  this.STAFF_AVAILABLE_SLOT.filter(data => data.workDate == value);
      let tempDay = new Date(value);
      let offset = tempDay.getTimezoneOffset()
      tempDay = new Date(tempDay.getTime() + (offset*60*1000))
      if (is_date_working.length == 0) { // If rota not found on current loop date
        daysConfig.push({ date: new Date(tempDay), disable: true });
      } else {
        let is_all_shift_booked = (await this._isNewDateDisabled(value)).filter(data => !data.is_disabled);
        if (is_all_shift_booked.length == 0) daysConfig.push({ date: new Date(tempDay), disable: true });

      }

    }
    
    this.options = { daysConfig: daysConfig } // Set Disabled Dates in Datepicker
  }

  async _isDateDisabled(value: any) {
    let booking_data = await this.dataService.getInitialBookingdata();
    let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
    let staff_rota = [];
    let current_date = await this.getCurrentDate();

    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {

        // Get  staff rota
        staff_rota = await staff_detail[0].staffDetailFormatted.filter(data => data.description == '' && new Date(data.workDate) >= new Date(current_date))
      }
    }

    let is_date_working = await staff_rota.filter(data => data.workDate == value);
    let current_date_booking = await this.STAFF_BOOKING_LIST.filter(data => data.startTime.includes(value));
    let shift_start_time: any = '';
    let shift_end_time: any = '';
    let all_shift_list: any;

    if(is_date_working.length > 0){
      if (is_date_working.length > 1) {
        all_shift_list = [];
        for (let value of is_date_working) {
          shift_start_time = value?.startShiftTime;
          shift_end_time = value?.endShiftTime;
          if(shift_end_time != '00:00:00'){
            shift_end_time = new Date(`${current_date}T${shift_end_time}`);
            shift_end_time.setMinutes(shift_end_time.getMinutes() - 30);
            shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes()) + ":" + (shift_end_time.getSeconds() == 0 ? '00' : shift_end_time.getSeconds());
            all_shift_list.push(...await this._returnTimesInBetween(shift_start_time, shift_end_time)) ;
          }
        }
        if(all_shift_list == null || all_shift_list.length == 0){
          shift_start_time = '00:00:00';
          const end_time = shift_end_time;
          shift_end_time = new Date(`${current_date}T${shift_end_time}`);
          shift_end_time.setMinutes(shift_end_time.getMinutes() - 30);
          shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes()) + ":" + (shift_end_time.getSeconds() == 0 ? '00' : shift_end_time.getSeconds());
          all_shift_list = await this._returnTimesInBetween(shift_start_time, shift_end_time);
          if(end_time == '00:00:00'){
            for (let shift_value of all_shift_list) {
              if (!shift_value.is_disabled) { // If shift is not disabled
                shift_value.is_disabled = true; 
              }
            }
          }
        }
      } else {
        shift_start_time = is_date_working[0]?.startShiftTime;
        shift_end_time = is_date_working[0]?.endShiftTime;
        const end_time = shift_end_time;
        shift_end_time = new Date(`${current_date}T${shift_end_time}`);
        shift_end_time.setMinutes(shift_end_time.getMinutes() - 30);
        shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes()) + ":" + (shift_end_time.getSeconds() == 0 ? '00' : shift_end_time.getSeconds());      
  
        all_shift_list = await this._returnTimesInBetween(shift_start_time, shift_end_time);
        if(end_time == '00:00:00'){
          for (let shift_value of all_shift_list) {
            if (!shift_value.is_disabled) { // If shift is not disabled
              shift_value.is_disabled = true; 
            }
          }
        }
      }
    }
    else {
      return
    }

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
    let booking_total_duration = 0;
    let total_shift_will_count = 1;

    for (let value of booking_data.servises) booking_total_duration += value.serviceDuration;

    booking_total_duration = booking_total_duration - 1;
    total_shift_will_count = booking_total_duration == 0 ? ~~(booking_total_duration / 30) : (~~(booking_total_duration / 30) + 1)
    // Shift disabled based on current time
    for (let shift_value of all_shift_list) {
      let shift__date_time = new Date(`${current_date}T${shift_value.value}:00`);
      const current_date_time = new Date();
      if (current_date_time.getMonth() == shift__date_time.getMonth() && current_date_time.getDate() == shift__date_time.getDate() && shift__date_time.getTime() < current_date_time.getTime()) {
        shift_value.is_disabled = true; // Disabled the shift
      }
    }

    // Set Soft disabled
    if (total_shift_will_count != 1) {
      let last_index = 0;
      let neighbour_difference = 0;
      for (let index in all_shift_list) {
        let checked_pass = true;

        if (all_shift_list[index]['is_disabled'] == false && Number(index) != all_shift_list.length-1) {

          for (let i = 1; i < total_shift_will_count; i++) {

            let num = Number(index) + i;


            if (typeof all_shift_list[num] !== 'undefined') {

              if (all_shift_list[num][''] == true && checked_pass == true) {

                checked_pass = false;
              }

            } else {

              checked_pass = false;
            }
          }

          if (!checked_pass) {
            all_shift_list[index]['is_disabled'] = true;
          }
        }
        else{
          neighbour_difference = Number(index) - last_index;
          if(neighbour_difference <= total_shift_will_count){
            for (let i = last_index + 1; i < Number(index); i++) {
              all_shift_list[i]['is_disabled'] = true;
            }
          }
          last_index = Number(index);
        }
      }
    }
    
    return all_shift_list
  }

  async _isNewDateDisabled(value: any){
    let all_shift_list: any = [];
    if(this.STAFF_AVAILABLE_SLOT.length != 0) {

      let current_available_slots = this.STAFF_AVAILABLE_SLOT.filter(data => data.workDate == value);
      all_shift_list = await this._returnShiftTimes(current_available_slots[0].availableSlots);
        // Shift disabled based on current time
        for (let shift_value of all_shift_list) {
          let shift__date_time = new Date(`${value}T${shift_value.value}:00`);
          const current_date_time = new Date();
          if (current_date_time.getMonth() == shift__date_time.getMonth() && current_date_time.getDate() == shift__date_time.getDate() && shift__date_time.getTime() < current_date_time.getTime()) {
            shift_value.is_disabled = true; // Disabled the shift
          }
        }
        //   // Shift disabled based on Booking time -- end
        let booking_data = await this.dataService.getInitialBookingdata();
        let booking_total_duration = 0;
        let total_shift_will_count = 1;

        for (let value of booking_data.servises) booking_total_duration += value.serviceDuration;

        booking_total_duration = booking_total_duration - 1;
        total_shift_will_count = booking_total_duration == 0 ? ~~(booking_total_duration / 5) : (~~(booking_total_duration / 5) + 1);
        // Set Soft disabled
        if (total_shift_will_count != 1) {
          let last_index = 0;
          let neighbour_difference = 0;
          for (let index in all_shift_list) {

            let checked_pass = true;

            if (all_shift_list[index]['is_disabled'] == false) {

              for (let i = 1; i < total_shift_will_count; i++) {

                let num = Number(index) + i;


                if (typeof all_shift_list[num] !== 'undefined') {

                  if (all_shift_list[num]['is_disabled'] == true && checked_pass == true) {

                    checked_pass = false;
                  }

                } else {

                  checked_pass = false;
                }
              }

              if (!checked_pass) {
                all_shift_list[index]['is_disabled'] = true;
              }
            }
            else{
              neighbour_difference = Number(index) - last_index;
              if(neighbour_difference <= total_shift_will_count){
                for (let i = last_index + 1; i < Number(index); i++) {
                  all_shift_list[i]['is_disabled'] = true;
                }
              }
              last_index = Number(index);
            }
          }
        }
      return all_shift_list;
    }
    else {
      return [];
    }
    

    // Shift disabled based on Booking time -- end

    
  }

  async openPicker() {

    setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
  }

  async _returnDateInBetween(start_date = new Date(), end_date = new Date(new Date().setMonth(new Date().getMonth() + 5))) {

    for (var date_list = [], d = new Date(start_date); d <= new Date(end_date); d.setDate(d.getDate() + 1)) {
      let today_date = new Date(d);
      let year: any = today_date.getFullYear();
      let month: any = today_date.getMonth() + 1; // Months start at 0!
      let day: any = today_date.getDate();

      if (day < 10) day = '0' + day;
      if (month < 10) month = '0' + month;

      date_list.push(year + '-' + month + '-' + day);

    }

    return date_list;
  }

  getCurrentDate() {

    let today_date = new Date();
    let year: any = today_date.getFullYear();
    let month: any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    return year + '-' + month + '-' + day;
  }

  async returnDateTimeFormat(date_time) {

    let today_date = new Date(date_time);
    let year: any = today_date.getFullYear();
    let month: any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();
    let hours: any = today_date.getHours();
    let minutes: any = today_date.getMinutes();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return await year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00.000';
  }

  async _returnTimesInBetween(start, end) {
    var timesInBetween = [];

    var startH = parseInt(start.split(":")[0]);
    var startM = parseInt(start.split(":")[1]);
    var endH = parseInt(end.split(":")[0]);
    var endM = parseInt(end.split(":")[1]);

    if (startM == 30){
      timesInBetween.push(startH < 10 ? "0" + startH + ":30" : startH + ":30");
      startH++;
    }

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
        id: result.length + 1,
        time: timeString,
        value: value,
        is_active: false,
        is_disabled: false,
        soft_disabled: false
      });
    }

    return result;
  }

  async _returnShiftTimes(availableSlots: any){
    let result = [];
    for (let timeString of availableSlots) {

      let value = timeString;
      let H = +timeString.substr(0, 2);
      let h = (H % 12) || 12;
      let ampm = H < 12 ? " AM" : " PM";
      timeString = h + timeString.substr(2, 3) + ampm;
      result.push({
        id: result.length + 1,
        time: timeString,
        value: value.substr(0, 5),
        is_active: false,
        is_disabled: false,
        soft_disabled: false
      });
    }
    return result;
  }

  async removePendingBooking() {

    await this.auth.getUser().subscribe(
      async (response: any) => {
        let userEmail;
        if (response.hasOwnProperty('email')) {
          userEmail = response.email;
        }
        else {
          userEmail = await this.dataService._getUserEmail();
        }
        (await this.apiData.getMyProfile(userEmail)).subscribe(
          async (user_info: any) => {
            (await this.apiData.removeUserPendingBoking(user_info.userGMID)).subscribe(
              (response: any) => {
              },

              (error: any) => {
              }
            );
          },

          async (error: any) => {
            await this.apiData.dismiss();
          }
        )

      },
      async (error: any) => {
        await this.apiData.dismiss();
      }
    );
  }


  async checkLogin() {
    await this.auth.getUser().subscribe(
      async (user_data: any) => {
        if (user_data !== undefined) {
          this.IS_LOGIN = true;
          clearTimeout(this.PENDING_BOOKING_TIMEOUT)

          let userEmail;
          if (user_data.hasOwnProperty('email')) {
            userEmail = user_data.email;
          }
          else {
            return;
          }

          (await this.apiData.getMyProfile(userEmail)).subscribe(
            async (user_info: any) => {
              if (user_info.statusCodeValue == 500) {
                (await this.apiData.addUser({ email: userEmail })).subscribe(
                  async (response: any) => {
                    await this.apiData.dismiss();
                  },
                  async (error: any) => {
                    if (error.status === 200) {
                      await this.apiData.dismiss();
                    }
                    else {
                      await this.apiData.dismiss();
                      await this.apiData.presentAlert('Server error, Please try again later');
                    }

                  }
                );
              }
            },
            async (error: any) => {

            }
          );
        }
      }
    );
  }

  navigation() {
    this.router.navigate(['/staff-service-details', this.SELECT_STAFF_ID],{ queryParams: this.CANCEL_BOOKING_ID == 0 ? {} : { id: this.CANCEL_BOOKING_ID } });
  }

  SelectStaff(staff_id: any) {
    this.SELECT_STAFF_ID = staff_id;
    this.SELECT_STAFF_OPEN = false;
  }

  async _getDisplayList(){



    let shift_list: any ;


    let all_dates = await this._returnDateInBetween();
    
    for (let value of all_dates) {


      let booking_data = await this.dataService.getInitialBookingdata();
      let staff_detail = await this.dataService.getStaffDetail(booking_data.staff_id);
      let staff_rota = [];
      let current_date = await this.getCurrentDate();

      if (staff_detail[0].staffDetailFormatted != null) {
        if (staff_detail[0].staffDetailFormatted.length > 0) {

          // Get  staff rota
          staff_rota = await staff_detail[0].staffDetailFormatted.filter(data => data.description == '' && new Date(data.workDate) >= new Date(current_date))
        }
      }

      let rota = await staff_rota.filter(data => data.workDate == value);

      shift_list = [];

      let is_date_working =  this.STAFF_AVAILABLE_SLOT.filter(data => data.workDate == value);

      if (is_date_working.length == 0) { // If rota not found on current loop date
        this.DISPLAY_LIST.push(
          {
            DATE: value,
            id: value,
            shift_list: shift_list
          }
        );
      } else {
        shift_list = await this._returnShiftTimes(is_date_working[0].availableSlots);

        for (let shift_value of shift_list) {
          for (const booking of this.STAFF_BOOKING_LIST) {// Shift disabled based on Booking time
            let booking_date_starTime = new Date(booking.startTime);
            let booking_date_endTime = new Date(booking.endTime);

            let shift__date_time = new Date(`${is_date_working[0].workDate}T${shift_value.value}:00`);
            const current_date_time = new Date();
            if (current_date_time.getMonth() == shift__date_time.getMonth() && current_date_time.getDate() == shift__date_time.getDate() && shift__date_time.getTime() < current_date_time.getTime()) {
              shift_value.is_disabled = true; // Disabled the shift
            }

            if(booking.employeeId == this.SELECT_STAFF_ID && booking_date_starTime.getMonth() == shift__date_time.getMonth() && 
              booking_date_starTime.getDate() == shift__date_time.getDate() && 
              shift__date_time.getTime() >= booking_date_starTime.getTime() && 
              shift__date_time.getTime() < booking_date_endTime.getTime()){
                shift_value.is_disabled = true; // Disabled the shift
            }
           

            for (let values of rota) {
              if (values.outOfOfficeFrom != null && values.outOfOfficeTo != null) {

                let break_start_time = new Date(`${value}T${values.outOfOfficeFrom}`);
                let break_end_time = new Date(`${value}T${values.outOfOfficeTo}`)
                
                break_end_time.setMinutes(break_end_time.getMinutes() - 1);

                // Shift will be disabled if shift time will exist in between break start & break end time
                if (break_start_time.getTime() <= shift__date_time.getTime() && break_end_time.getTime() > shift__date_time.getTime()) {
                  shift_value.is_disabled = true; // Disabled the shift
                }

              }
            }
          }
        }
        //console.log("shift_list",JSON.stringify(shift_list));
        let booking_total_duration = 0;
        let total_shift_will_count = 1;

        let availableSlotsCount = shift_list.length;

        for (let value of booking_data.servises) booking_total_duration += value.serviceDuration;
    
        booking_total_duration = booking_total_duration - 1;
        total_shift_will_count = booking_total_duration == 0 ? ~~(booking_total_duration / 5) : (~~(booking_total_duration / 5) + 1);
        // Set Soft disabled
        if (total_shift_will_count != 1) {
          let last_index = 0;
          let neighbour_difference = 0;
          
          for (let index in shift_list) {
            let checked_pass = true;
            if (shift_list[index]['is_disabled'] == false) {
              for (let i = 1; i < total_shift_will_count; i++) {
                let num = Number(index) + i;
                if (typeof shift_list[num] !== 'undefined') {
                  if (shift_list[num]['is_disabled'] == true && checked_pass == true) {
                    checked_pass = false;
                  }
                } else {
                  checked_pass = false;
                }
              }
              if (!checked_pass) {
                shift_list[index]['is_disabled'] = true;
                availableSlotsCount--;
              }
            }
            else{
              availableSlotsCount--;
              neighbour_difference = Number(index) - last_index;
              if(neighbour_difference <= total_shift_will_count){
                for (let i = last_index + 1; i < Number(index); i++) {
                  shift_list[i]['is_disabled'] = true;
                }
              }
              last_index = Number(index);
            }
          }
        }
        if (availableSlotsCount <= 0){
          shift_list = [];
        }
        this.DISPLAY_LIST.push(
          {
            DATE: is_date_working[0].workDate,
            id: is_date_working[0].workDate,
            shift_list: shift_list
          }
        );
      }
    }
    this.DISPLAY_LIST.sort((a, b) => {
      return (new Date(`${a.DATE}`)).getTime() - (new Date(`${b.DATE}`)).getTime();
    });
  }
}
