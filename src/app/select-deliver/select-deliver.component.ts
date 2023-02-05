import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-select-deliver',
  templateUrl: './select-deliver.component.html',
  styleUrls: ['./select-deliver.component.scss'],
})
export class SelectDeliverComponent implements OnInit {

  HEADING: string = "Select delivery";
  DELIVERY: boolean = false;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public imageService: ImageService,
  ) { }

  ngOnInit() {}

  navigation() {

    this.router.navigate(['/cart-detail'])
  }
}
