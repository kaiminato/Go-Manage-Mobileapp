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
  IS_CALNDER_OPEN: boolean = true;
  date: string = '';
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
    private dataService: DataService,
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
        //console.log('params',params.hasOwnProperty('id') ? params : ''); // { orderby: "price" }
      }
    );

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH-1]+" "+ this.CURRENT_YEAR;

    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);

    await this.setNonWorkingDaysOff()
    

    this.ALL_SHIFT = await this.dataService.getNewStaticShift(new Date().getDay());

    this.MORNING_SHIFT = [... this.ALL_SHIFT]
    let new_date = new Date();
    this.slides.slideTo(new_date.getDate()-1,1000);

    await this.getWeeklyDaysOff();
    await this.preFilledData();
    await this.getStaffBookingList();

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

  async setNonWorkingDaysOff () {

    let staff_list = await this.dataService.getStaffList();

    //console.log('staff_list----' , staff_list)

    for (let current_date of this.DAYS_ARRAY){
      
      let created_date = new Date(`${current_date.year}-${current_date.month}-${current_date.day_number < 10 ? '0'+current_date.day_number : current_date.day_number}`);
      let is_date_disabled = true;

      if (!current_date.is_disabled) {

      
        for(let staff of staff_list){

          let get_working_day = staff.staffDetailFormatted.filter( data => data.dayId == created_date.getDay())

          if (get_working_day.length > 0) { is_date_disabled = false; }

        }

        current_date.is_disabled = is_date_disabled;
        
        //console.log('created_date------' , created_date , created_date.getDay())
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

        let is_day_working = all_staff[index].staffDetailFormatted.filter( data => data.dayId == day_num);

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

  async onDateSelect (selected_date: any){
    
    //console.log('selected_date---this', selected_date)
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

  async selectDateRangeSlider (day: any, is_disabled: any, month: any, year: any){

    if (is_disabled) return;
    this.date = `${year}-${month}-${day < 10 ? '0'+day : day}`;
    //console.log(this.date , '>>>>>>>>>>>')

    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);
    await this.setNonWorkingDaysOff()
    
    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()]+ ' '+ new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;

    await this.checkAllShiftStatus(this.date);
  }

  async checkAllShiftStatus (date: any) {

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
        //console.log('expire' , all_shift[index].value)
      }
    }

    this.MORNING_SHIFT = all_shift;
    return
    //console.log('this-------------' ,this.MORNING_SHIFT)
  }

  async selectTiming (id: number , timing_type: any, is_disabled : any){

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
    
    //console.log('get_booking_data>>>>>>>', this.MORNING_SHIFT , get_booking_data)

    setTimeout(() => { this.router.navigate(['/select-staff-with-service-booking'] , { queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } }) }, 200);
    
  }

  navigation() {

    this.location.back();
  }
}
