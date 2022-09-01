import { Component, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-make-a-booking',
  templateUrl: './make-a-booking.component.html',
  styleUrls: ['./make-a-booking.component.scss'],
})
export class MakeABookingComponent implements OnInit {

  IS_STAFF: any = true;
  HEADING: string = "Make a booking";

  STAFF_LIST: any = [
    {id:1, name: 'Jade amber', image: this.imageService.DEFAULT_PERSON},
    {id:2, name: 'Testing', image:  this.imageService.DEFAULT_PERSON},
    {id:3, name: 'Tester', image:  this.imageService.DEFAULT_PERSON},
  ];

  SERVICE_LIST: any = [
    {id:1, name: 'Hair Service', image: this.imageService.DEFAULT_PERSON},
    {id:2, name: 'Nail Service', image:  this.imageService.DEFAULT_PERSON},
    {id:3, name: 'Waxing Service', image:  this.imageService.DEFAULT_PERSON},
  ];
  constructor(
    public imageService: ImageService,
    private router: Router,
   ) { 
    
      console.log('STAFF_LIST----', this.STAFF_LIST)
  }

  ngOnInit() {}

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
