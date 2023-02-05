import { Component, OnInit , Input ,  Output, EventEmitter } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-book-now-header',
  templateUrl: './book-now-header.component.html',
  styleUrls: ['./book-now-header.component.scss'],
})
export class BookNowHeaderComponent implements OnInit {

  @Output() navigation = new EventEmitter<string>();
  @Input() HEADING_TEXT = '';
  @Input() IS_BACK = '';
  @Input() BOOKING_WITH_STAFF = '';
  constructor(public dataService: DataService) {
   
  }


  ngOnInit() {}

  async ionViewWillEnter (){
   
    let get_booking_data = await this.dataService.getInitialBookingdata();
    
  }

  back() {
    this.navigation.emit();
    
  }

}
