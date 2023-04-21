import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
})
export class ContactUsComponent implements OnInit {

  HEADING: string = "Contact us";
  
  constructor(
    public imageService: ImageService,
    public auth: AuthService,
    private apiDataService: ApiDataService,
    public dataService: DataService,) { }

  ngOnInit() {}

}
