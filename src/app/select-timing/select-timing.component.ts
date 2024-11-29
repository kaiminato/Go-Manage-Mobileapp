import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';
import { IonModal } from '@ionic/angular';
import { ApiDataService } from '../services/api-data.service';
import { AuthService } from '@auth0/auth0-angular';
import { ChangeDetectorRef } from '@angular/core';

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
  ALL_SHIFT: any = [];
  CANCEL_BOOKING_ID: number = 0;
  IS_CALNDER_OPEN: boolean = false;
  IS_CONFIRM_OPEN: boolean = false;
  SELECT_STAFF_OPEN: boolean = false;
  DATE: string = '';
  DATE_TYPE: 'object';
  IS_LOGIN: boolean = false;
  BOOKING_WITH_STAFF: any = true;
  PENDING_BOOKING_TIMEOUT: any;
  STAFF_AVAILABLE_SLOT: any = [];
  SELECT_STAFF_ID: any;
  AVAILABLE_STAFF_LIST: any = [];

  STAFF_AVAILABLE_SLOT_LIST: any = [];
  DISPLAY_LIST: any = [];
  slideOpts = {
    slidesPerView: 6,
    initialSlide: 10,
    speed: 400,
    loop: false,
  };
  ALL_DISPLAY_LIST: any = [];
  availableDates: string[] = [];


  options: CalendarModalOptions = {
    daysConfig: [
    ]
  };

  markDisabled: any = (date: Date) => {
    var current = new Date();
    return date < current;
  };


  BOOKING_DATA: any = [];
  BOOKING_TYPE: any;
  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    public dataService: DataService,
    public apiService: ApiDataService,
    public auth: AuthService,
    private apiData: ApiDataService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef for change detection
  ) {
    this.BOOKING_DATA = this.dataService.getInitialBookingdata();
    console.log("Initial booking data", this.dataService.getInitialBookingdata());
    this.BOOKING_TYPE = this.BOOKING_DATA?.booking_type;
    console.log("this.BOOKING_TYPE", this.BOOKING_TYPE);
    this.SELECT_STAFF_ID = this.BOOKING_DATA?.staff_id;
    this.getAllAvailableSlotsByEmployee(this.BOOKING_DATA);
    this.DATE = this.getCurrentDate();
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
    try {
      this.activateRoute.queryParams
        .subscribe(params => {
          this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        }
        );

      let booking_data = this.BOOKING_DATA;
      this.SELECT_STAFF_ID = booking_data?.staff_id;
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
        this._onDateSelect(response["selectedDate"]); // This will filter DISPLAY_LIST
      } else {
        // If no pre-selected date, set DISPLAY_LIST to current date
        this._onDateSelect(this.DATE);
      }
    } catch (error) {
      console.error('Error in ionViewWillEnter:', error);
    }

  }

  async getAllAvailableSlotsByEmployee(bookingData: any) {
    // Calculate the total service duration
    const totalDuration = bookingData.servises.reduce((sum: number, service: any) => {
      return sum + service.serviceDuration;
    }, 0);

    try {
      (await this.apiData.getSlotsAvailableForEmployeeAndServiceDuration(bookingData.staff_id, totalDuration)).subscribe(
        (response: any) => {
          this.STAFF_AVAILABLE_SLOT = response;
          this.displayAvailableSlots();

          // Automatically select the first available date
          const firstAvailableDate = this.findFirstAvailableDate();
          if (firstAvailableDate) {
            this.DATE = firstAvailableDate; // Set the first available date
            this._onDateSelect(firstAvailableDate); // Ensure it updates the displayed slots
          }

          this.isVisible = true;
        },
        (error: any) => {
          console.error('Error fetching available slots:', error);
        }
      );
    } catch (error) {
      console.error('Error in getAllAvailableSlotsByEmployee:', error);
    }
  }
  ionViewWillLeave() {
    this.IS_CALNDER_OPEN = false;
    this.IS_CONFIRM_OPEN = false;
    this.SELECT_STAFF_OPEN = false;
  }

  // Function to find the first available date with slots
  findFirstAvailableDate(): string | null {
    for (const slot of this.STAFF_AVAILABLE_SLOT) {
      if (slot.availableSlots && slot.availableSlots.length > 0) {
        return slot.workDate;  // Return the first date with available slots
      }
    }
    return null;  // Return null if no available date is found
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
    let booking_data = this.BOOKING_DATA;

    this.DATE = booking_data.date;

    if (this.ALL_SHIFT.length == 0) return;
    if (booking_data.timing_id != '') {

      setTimeout(() => {
        this.ALL_SHIFT[booking_data.timing_id.id - 1].is_active = true;
      }, 300);
    }
  }

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
  async _selectTiming(selected_date: any, id: number, is_disabled: any) {
    this.DATE = selected_date;

    if (is_disabled) return;

    let selected_shift_list = this.DISPLAY_LIST.filter((data) => data.DATE == selected_date);
    let selected_shift = selected_shift_list[0].shift_list.filter((data) => data.id == id);

    let get_booking_data = this.BOOKING_DATA;
    get_booking_data.date = this.DATE;
    get_booking_data.timing_id = selected_shift[0];

    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration;

    let starting_date_time = new Date(`${this.DATE}T${selected_shift[0].value}`);
    let ending_date_time = new Date(`${this.DATE}T${selected_shift[0].value}`);
    ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration - 1)
    ending_date_time = new Date(ending_date_time);

    let pen_book_end_time = new Date(`${this.DATE}T${selected_shift[0].value}`);
    pen_book_end_time.setMinutes(pen_book_end_time.getMinutes() + total_duration)
    pen_book_end_time = new Date(pen_book_end_time);
    pen_book_end_time = <any>await this.returnDateTimeFormat(pen_book_end_time);

    let create_pending_booking_start_time = await this.returnDateTimeFormat(starting_date_time);

    if (!this.IS_LOGIN) {
      await this.dataService.saveSelectTimingInfo("true", this.DATE, JSON.stringify(get_booking_data.timing_id), String(id));

      this.auth.loginWithRedirect({
        appState: { target: '/select-a-time' }
      })
      return
    } else {
      await this.dataService.saveSelectTimingInfo("false", this.DATE, String(id), String(id));
    }


    try {
      const response = await this.auth.getUser().toPromise();
      let userEmail = response?.email || (await this.dataService._getUserEmail());

      if (!userEmail) {
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 200);
        return;
      }

      const user_info = await (await this.apiData.getMyProfile(userEmail)).toPromise();

      let data = {
        userId: user_info.userGMID,
        staffId: get_booking_data.staff_id,
        isPending: 1,
        startTime: create_pending_booking_start_time,
        endTime: pen_book_end_time,
        serviceId: get_booking_data.servises[0].id,
      };

      console.log(data)
      try {
        await this.apiData.createPendingAppointment(data);
        // Continue with your logic after the appointment is created
      } catch (error) {
        console.error('Error creating pending appointment:', error);
        // Handle the error appropriately
      }

      // Proceed to booking summary
      await this.dataService.setBookingData(get_booking_data);
      setTimeout(() => {
        this.router.navigate(['/booking-summary', this.SELECT_STAFF_ID], {
          queryParams: this.CANCEL_BOOKING_ID == 0 ? {} : { id: this.CANCEL_BOOKING_ID },
        });
      }, 200);
    } catch (error) {
      console.error('Error in _selectTiming:', error);
      // Optionally, display an error message to the user
      await this.apiData.presentAlert('An error occurred. Please try again.');
    }
  }

  getMonthFromDayIndex(dayIndex, year) {
    var date = new Date(year, 0);
    date.setDate(dayIndex);

    return date.getMonth() + 1;
  }

  closeConfirm() {
    this.IS_CONFIRM_OPEN = false;
    for (let shift of this.ALL_SHIFT) {
      if (shift.value == this.STARTING_TIME) {
        shift.is_active = false;
      }
    }
  }

  confirmPresaved() {
    this.IS_CONFIRM_OPEN = false;
    this._selectTiming(this.DATE, this.TIME_ID, false);
  }

  async displayAvailableSlots() {
    try {
      if (!this.STAFF_AVAILABLE_SLOT || this.STAFF_AVAILABLE_SLOT.length === 0) {
        return;
      }

      // Map all available slots to ALL_DISPLAY_LIST
      this.ALL_DISPLAY_LIST = this.STAFF_AVAILABLE_SLOT.map((slotData) => {
        return {
          DATE: slotData.workDate,
          id: slotData.workDate,
          shift_list: slotData.availableSlots.map((time, index) => ({
            id: index,
            time: this.formatTimeTo12Hr(time),
            value: time.substr(0, 5),
            is_active: false,
            is_disabled: false,
            soft_disabled: false,
          })),
        };
      });

      // Extract availableDates from STAFF_AVAILABLE_SLOT
      this.availableDates = this.STAFF_AVAILABLE_SLOT.map(slot => slot.workDate);

      // Configure the calendar to disable dates not in availableDates
      this.configureCalendar();

      // Initialize DISPLAY_LIST with slots for the current date
      this.DISPLAY_LIST = this.ALL_DISPLAY_LIST.filter(data => data.DATE === this.DATE);

    } catch (error) {
      console.error('Error in displayAvailableSlots:', error);
    }
  }

  /**
   * Configure the calendar to disable dates not in availableDates
   */
  configureCalendar() {
    const daysConfig = [];

    const today = new Date();
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(today.getFullYear() + 2); // Limit to 2 years in the future

    // Disable all dates by default, only enable dates in availableDates
    let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    while (currentDate <= twoYearsFromNow) {
      const dateString = this.formatDate(currentDate); // Format as 'YYYY-MM-DD'

      // Check if the current date is available
      const isAvailable = this.availableDates.includes(dateString);

      daysConfig.push({
        date: new Date(currentDate),
        disable: !isAvailable,  // Disable the date if not in availableDates
        cssClass: isAvailable ? 'enabled-date' : 'disabled-date',  // Add CSS class to differentiate
      });

      currentDate.setDate(currentDate.getDate() + 1); // Move to the next date
    }

    // Update calendar options with the new daysConfig
    this.options = {
      ...this.options,
      daysConfig: daysConfig,
      from: today,   // Start from today
      to: twoYearsFromNow, // Prevent navigation beyond two years from now
    };

    // Trigger change detection to update the calendar
    this.cdr.detectChanges();
  }



  /**
 * Helper method to format Date object to 'YYYY-MM-DD' string
 */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTimeTo12Hr(timeString: string): string {
    let H = +timeString.substr(0, 2);
    let h = (H % 12) || 12;
    let ampm = H < 12 ? ' AM' : ' PM';
    return h + timeString.substr(2, 3) + ampm;
  }

  selectTiming(date: string, shiftId: number, isDisabled: boolean) {
    if (isDisabled) return; // Do nothing if the shift is disabled

    // Your logic to handle the selection
    // For example, mark the shift as active
    this.DISPLAY_LIST.forEach(data => {
      if (data.DATE === date) {
        data.shift_list.forEach(shift => {
          shift.is_active = shift.id === shiftId;
        });
      } else {
        data.shift_list.forEach(shift => {
          shift.is_active = false;
        });
      }
    });
  }

  async _onDateSelect(selected_date: string) {
    if (this.BOOKING_TYPE == 2) {
      this.DATE = selected_date;
      this.IS_CALNDER_OPEN = false;
      const totalDuration = this.BOOKING_DATA.servises.reduce((sum: number, service: any) => {
        return sum + service.serviceDuration;
      }, 0);
      this.STAFF_AVAILABLE_SLOT_LIST = [];

      try {
        for (let i = 0; i < this.BOOKING_DATA.servises.length; i++) {
          let reference_id = this.BOOKING_DATA.staff_id;
          let staff_id = this.BOOKING_DATA.servises[i].staff_id;

          // console.log(this.BOOKING_DATA);
          // console.log("Staff ID", staff_id);
          // console.log("Reference ID", reference_id);
          // Await the API call and convert Observable to Promise
          const response = await (await (reference_id ? this.apiData.getSlotsAvailableForEmployeeAndServiceDuration(staff_id, totalDuration) : this.apiData.getSlotsAvailableForWholeDayAndServiceDuration(totalDuration))).toPromise();

          this.ALL_DISPLAY_LIST = response.map((slotData) => {
            return {
              DATE: slotData.workDate,
              id: slotData.workDate,
              shift_list: slotData.availableSlots.map((time, index) => ({
                id: index,
                time: this.formatTimeTo12Hr(time),
                value: time.substr(0, 5),
                is_active: false,
                is_disabled: false,
                soft_disabled: false,
              })),
            };
          });

          this.DISPLAY_LIST = this.ALL_DISPLAY_LIST.filter(data => data.DATE === this.DATE);

          if (i > 0) {
            this.DISPLAY_LIST[0].shift_list = this.DISPLAY_LIST[0].shift_list.filter(item1 =>
              this.STAFF_AVAILABLE_SLOT_LIST[0]?.shift_list?.some(item2 => item1.value === item2.value)
            );
          }
          //console.log("this.STAFF_AVAILABLE_SLOT_LIST",this.STAFF_AVAILABLE_SLOT_LIST);
          // Store DISPLAY_LIST in STAFF_AVAILABLE_SLOT_LIST at the end of each iteration
          this.STAFF_AVAILABLE_SLOT_LIST = this.DISPLAY_LIST;
        }
        this.DISPLAY_LIST = this.STAFF_AVAILABLE_SLOT_LIST;
        //console.log("this.DISPLAY_LIST",this.DISPLAY_LIST);
        const desiredDateId = this.DATE;
        const element = document.getElementById(desiredDateId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
      } catch (error) {
        console.error('Error in getAllAvailableSlotsByEmployee:', error);
      }
    }
    else {
      this.DATE = selected_date;
      this.IS_CALNDER_OPEN = false;

      // Filter DISPLAY_LIST to include only the selected date's slots
      this.DISPLAY_LIST = this.ALL_DISPLAY_LIST.filter(data => data.DATE === this.DATE);

      // Scroll to the selected date's slot section
      const desiredDateId = this.DATE;
      const element = document.getElementById(desiredDateId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
      }
    }
  }

  async openPicker() {

    setTimeout(() => { this.IS_CALNDER_OPEN = true; }, 100);
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

  async _returnShiftTimes(availableSlots: any) {
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
                  },
                  async (error: any) => {
                    if (error.status === 200) {
                    }
                    else {
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
    this.router.navigate(['/staff-service-details', this.SELECT_STAFF_ID], { queryParams: this.CANCEL_BOOKING_ID == 0 ? {} : { id: this.CANCEL_BOOKING_ID } });
  }

  SelectStaff(staff_id: any) {
    this.SELECT_STAFF_ID = staff_id;
    this.BOOKING_DATA.staff_id = staff_id; // Update the booking data with new staff ID
    this.SELECT_STAFF_OPEN = false;

    console.log("Booking data staff id updated ", staff_id);

    // Clear previous slots data
    this.DISPLAY_LIST = [];
    this.STAFF_AVAILABLE_SLOT = [];

    // Fetch new slots for the selected staff member
    this.getAllAvailableSlotsByEmployee(staff_id).then(() => {
      // After fetching, filter DISPLAY_LIST based on the current DATE
      this.DISPLAY_LIST = this.ALL_DISPLAY_LIST.filter(data => data.DATE === this.DATE);
    });
  }

}
