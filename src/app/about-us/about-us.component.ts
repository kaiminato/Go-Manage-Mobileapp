import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent implements OnInit {

  HEADING: string = "About us";
  STAFF_LIST: any = [
    {id:1, firstName: 'Jade', lastName: 'amber', image: this.imageService.DEFAULT_PERSON},
    {id:2, firstName: 'Testing', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
    {id:3, firstName: 'Tester', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
  ];
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public imageService: ImageService,
  ) { }

  ngOnInit() {}

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }
}
