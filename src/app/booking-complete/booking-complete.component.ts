import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-booking-complete',
  templateUrl: './booking-complete.component.html',
  styleUrls: ['./booking-complete.component.scss'],
})
export class BookingCompleteComponent implements OnInit {

  NAME: string = '';
  RECIEPT_URL: string = ""
  constructor(
    public  imageService: ImageService,
    private dataService: DataService,
    ) { }

  ngOnInit() {}

  async ionViewWillEnter (){

    let data = await this.dataService.getInitialBookingdata();
    this.RECIEPT_URL = data.reciept_url;
    let staff_details = await this.dataService.getStaffDetail(data.staff_id);
    console.log('data---' , data)
    //this.NAME = `${staff_details[0].firstName} ${staff_details[0].lastName}`
    this.NAME = 'Jade Amber'
  }

  async ionViewWillLeave() {

    await this.dataService.removeBookingdata();
  }

}
