import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent implements OnInit {

  HEADING: string = "Booking Summary";
  DATE: string;
  TOTAL_DURATION: any = 0;
  STARTING_TIME: string;
  ENDING_TIME: string;
  STUDIO_NAME: string = 'beauty studio Corogin galway';
  TOTAL_AMOUNT: any = 0;
  BOOKINGS_DETAILS: any;

  constructor(
    private router: Router,
    private location: Location,
    private dataService: DataService,
    public  imageService: ImageService,
    ) {

    }

  ngOnInit() {}

  async ionViewWillEnter (){

    this.BOOKINGS_DETAILS = await this.dataService.getInitialBookingdata();
    this.BOOKINGS_DETAILS.staff_details = await this.dataService.getStaffDetail(this.BOOKINGS_DETAILS.staff_id);
    let shift_timing_details = await this.dataService.getShift();
    this.BOOKINGS_DETAILS.shift_timing_details = await shift_timing_details.filter( data => data.id == this.BOOKINGS_DETAILS.timing_id);
    let [start_time , am_pm] = this.BOOKINGS_DETAILS.shift_timing_details[0].time.split(' ')

    this.STARTING_TIME = `${start_time}${am_pm}`;

    for (let service of this.BOOKINGS_DETAILS.servises){
      
      this.TOTAL_DURATION += service.serviceDuration;
      this.TOTAL_AMOUNT += service.servicePrice;
    }
    this.STUDIO_NAME = this.BOOKINGS_DETAILS.staff_details[0].firstName+" "+this.BOOKINGS_DETAILS.staff_details[0].lastName+ " "+this.STUDIO_NAME;
    let [year , month , day ] = this.BOOKINGS_DETAILS.date.split('-');
    let new_date = new Date(this.BOOKINGS_DETAILS.date);
    let get_month_name = await this.dataService.MONTHS_NAME[new_date.getMonth()]; 

    this.DATE = `${day} ${get_month_name} ${year}`;

    var now = new Date(`${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.shift_timing_details[0].value}`);
    now.setMinutes(now.getMinutes() + this.TOTAL_DURATION); // timestamp
    now = new Date(now); // Date object
    let {without_space_time} = await this.formatAMPM(now)
    this.ENDING_TIME = without_space_time
    console.log('cheing --- ',this.formatAMPM(now))
    
    console.log('BOOKINGS_DETAILS-- ',get_month_name, this.BOOKINGS_DETAILS)
  }

  async formatAMPM(date) {
    
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let str_time = hours + ':' + minutes + ' ' + ampm;
    let str_time_without_space = hours + ':' + minutes + ampm;
    
    return await {with_space_time: str_time , without_space_time: str_time_without_space};
  }

  navigation() {

    this.location.back();
  }
} 
