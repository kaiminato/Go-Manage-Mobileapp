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
  
  constructor(
    private router: Router,
    private location: Location,
    private dataService: DataService,
    public  imageService: ImageService,
    ) {

    }

  ngOnInit() {}

  navigation() {

    this.location.back();
  }
} 
