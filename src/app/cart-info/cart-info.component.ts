import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cart-info',
  templateUrl: './cart-info.component.html',
  styleUrls: ['./cart-info.component.scss'],
})
export class CartInfoComponent implements OnInit {

  HEADING: string = "Shopping Cart";

  PRODUCT_LIST: any = [
                        {id: 1 , name: 'Nike Shoe' , price: 24 , count: 1 , image: this.imageService.SHOE},
                        {id: 2 , name: 'Ladies beg' , price: 24 , count: 1 , image: this.imageService.BEG},
                      ];
  
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public imageService: ImageService,
    private location: Location,
  ) { }

  ngOnInit() {}

  navigation() {

    this.location.back();
  }

}
