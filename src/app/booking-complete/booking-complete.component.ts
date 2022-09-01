import { Component, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-booking-complete',
  templateUrl: './booking-complete.component.html',
  styleUrls: ['./booking-complete.component.scss'],
})
export class BookingCompleteComponent implements OnInit {

  constructor(public  imageService: ImageService) { }

  ngOnInit() {}

}
