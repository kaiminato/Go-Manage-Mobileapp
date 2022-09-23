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
  constructor(public dataService: DataService) {
   console.log('khkjh')
   }


  ngOnInit() {}

  async ionViewWillEnter (){
    console.log('yesh')
    let get_booking_data = await this.dataService.getInitialBookingdata();
    console.log(get_booking_data)
  }

  back() {
    this.navigation.emit();
    console.log('cliked')
  }

}
