import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-staff-service-details',
  templateUrl: './staff-service-details.component.html',
  styleUrls: ['./staff-service-details.component.scss'],
})
export class StaffServiceDetailsComponent implements OnInit {

  ID: any = '';
  HEADING: string = "";

  USER_INFO: any = {
    name: 'Jade',
    image: this.imageService.DEFAULT_PERSON,
    comment: 'Quick bio on the worker of what they like & hobbies and what they are qualified in will be added here',
    service_list : [
      {
        id: 1,
        name: 'Nails',
        count:3,
        is_open: false,
        services: [
          {
            id: 1,
            name: 'File and Polish',
            price: '$25.00',
          },
          {
            id: 2,
            name: 'Callus Peel',
            price: '$30.00',
          },
          {
            id: 3,
            name: 'Get Colour',
            price: '$20.00',
          },
        ]
      },
      {
        id: 2,
        name: 'Waxing',
        is_open: false,
        count:3,
        services: [
          {
            id: 4,
            name: 'Leg hair',
            price: '$25.00',
          },
          {
            id: 5,
            name: 'hand hair',
            price: '$30.00',
          },
          {
            id: 6,
            name: 'Chest hair',
            price: '$20.00',
          },
        ]
      }
    ],
  }

  constructor(
    public router: Router,
    private activateRoute: ActivatedRoute,
    public imageService: ImageService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter() {
    
    this.ID = this.activateRoute.snapshot.paramMap.get('id');
    console.log('this.ID------', this.ID, this.USER_INFO);
    this.HEADING = "Book with Jade";
  }

  changeServiceStatus (service_id: any , status){

    this.USER_INFO.service_list[service_id].is_open = !status ;
    
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/make-a-booking']);
  }

}
