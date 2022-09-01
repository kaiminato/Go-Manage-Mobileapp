import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PickerController } from '@ionic/angular';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-select-timing',
  templateUrl: './select-timing.component.html',
  styleUrls: ['./select-timing.component.scss'],
})
export class SelectTimingComponent implements OnInit {

  HEADING: string = "Select a time";
  CURRENT_MONTH: number = this.dataService.CURRENT_MONTH;
  CURRENT_YEAR: number = this.dataService.CURRENT_YEAR;
  CURRENT_MONTH_VALUE: string = 'August';
  DAYS_ARRAY : any = [];
  MORNING_SHIFT : any = [];
  EVENING_SHIFT : any = [];
  ALL_SHIFT : any = [];
  ACTIVE_DAY: number = 10;
  IS_STAFF: any = true;


  constructor(
    private router: Router,
    private location: Location,
    private pickerCtrl: PickerController,
    public dataService: DataService
    ) {

    }

  ngOnInit() {}

  async ionViewWillEnter () {

    this.DAYS_ARRAY =  await this.dataService.getDays(this.CURRENT_YEAR , this.CURRENT_YEAR);
    this.ALL_SHIFT = await this.dataService.getShift();
    this.MORNING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.MORNING_SHIFT);
    this.EVENING_SHIFT = this.ALL_SHIFT.filter(data => data.shift_type == this.dataService.EVENING_SHIFT);
  }

  slideOpts = {
    slidesPerView: 6,
    initialSlide: 10,
    speed: 400,
    loop: false,
  };

  async openPicker() {

    let month_list = await this.dataService.getMonths();
    let year_list = await this.dataService.getYears();
    const picker = await this.pickerCtrl.create({
      columns: [
        { name: 'month', options: month_list, },
        { name: 'year', options: year_list, },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (value) => {
            
            this.CURRENT_MONTH = value.month.value;
            this.CURRENT_YEAR = value.year.value;
          },
        },
      ],
    });

    await picker.present();
  }


  selectTiming (id: number , timing_type){

    for (let m_shift of this.MORNING_SHIFT) m_shift.is_active = m_shift.id == id ? true : false;

    for (let e_shift of this.EVENING_SHIFT) e_shift.is_active = e_shift.id == id ? true : false;

    setTimeout(() => {
      this.router.navigate(['/booking-summary'])
    }, 200);
    //this.router.navigate(['/booking-summary'])
  }

  navigation() {

    this.location.back();
  }

}
