import { Component, OnInit , ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { CalendarModalOptions } from 'ion2-calendar';
import { Router } from '@angular/router';
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
    private apiData: ApiDataService
    ) { }

  ngOnInit() {}

  async ionViewWillEnter (){

    this.MONTH_NAME_LIST = await this.dataService.MONTHS_NAME;
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[this.CURRENT_MONTH-1]+" "+ this.CURRENT_YEAR;

    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_MONTH , this.CURRENT_YEAR);

    this.ALL_SHIFT = await this.dataService.getStaticShift();
    this.MORNING_SHIFT = [... this.ALL_SHIFT]
    let new_date = new Date();
    this.slides.slideTo(new_date.getDate()-1,1000);
   
    console.log('this.DAYS_ARRAY------',  this.DAYS_ARRAY)

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
    
    console.log('selected_date---', selected_date)
    this.date = selected_date;
    this.IS_CALNDER_OPEN = false;
    this.modalController.dismiss();
    let [year , month , date] = this.date.split('-')

    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);

    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()] + " "+new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;
    this.slides.slideTo(new_date.getDate()-1,1000);//(index_number, speed_time)
    
    await this.checkAllShiftStatus(this.date);
  }

  async selectDateRangeSlider (day: any, is_disabled: any, month: any, year: any){

    if (is_disabled) return;
    this.date = `${year}-${month}-${day < 10 ? '0'+day : day}`;
    console.log(this.date)

    this.DAYS_ARRAY =  await this.dataService.getDays(month , year);

    let new_date = new Date(this.date)
    this.CURRENT_MONTH_VALUE = this.MONTH_NAME_LIST[new_date.getMonth()]+ ' '+ new_date.getFullYear()
    this.DAYS_ARRAY[new_date.getDate()-1].is_active = true;

    await this.checkAllShiftStatus(this.date);
  }

  async checkAllShiftStatus (date: any) {

    let all_shift = await this.dataService.getStaticShift();
    let all_staff = await this.dataService.getStaffList();
    console.log('shift', all_shift)

    for (let shift of all_shift) {
      
      let check_date_time = new Date(`${date} ${shift.value}`);
      shift.staff_ids = [];
      
      for (let staff of all_staff){
 
        let staff_date_booking = await this.dataService.getStaffBookingDetailWithDate(staff.id, date)
        staff_date_booking.sort(function (a, b) { return a.startTime.localeCompare(b.startTime); }); // sort array in ascending order
        
        if (staff_date_booking.length == 0) continue;

        for (let booking of staff_date_booking) {

          let start_date_time = new Date(booking.startTime);
          let end_date_time = new Date(booking.endTime)
          end_date_time = new Date(end_date_time.setMinutes(end_date_time.getMinutes() - 1))
          
          if (check_date_time >= start_date_time && check_date_time <= end_date_time) shift.staff_ids.push(staff.id);
          
        }
       
      }

      shift.all_staff_id = [... new Set(shift.staff_ids)]
      shift.is_disabled = shift.all_staff_id.length == all_staff.length;
      
    }

    this.MORNING_SHIFT = all_shift;
  }

  async selectTiming (id: number , timing_type: any, is_disabled : any){

    if (is_disabled) return ;

    if (this.date == '') {
      await this.apiService.presentAlert('Please select a available date');
      return
    }

    let selecetd_shift = this.ALL_SHIFT.filter(data => data.id == id);
    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.date = this.date;
    get_booking_data.timing_id = id;
    
    for (let m_shift of this.MORNING_SHIFT) m_shift.is_active = m_shift.id == id ? true : false;

    //for (let e_shift of this.EVENING_SHIFT) e_shift.is_active = e_shift.id == id ? true : false;

    await this.dataService.setBookingData(get_booking_data)
    
    console.log('get_booking_data>>>>>>>', get_booking_data)
    setTimeout(() => { this.router.navigate(['/select-staff-with-service-booking']) }, 200);
    
  }

  navigation() {

    this.location.back();
  }
}
