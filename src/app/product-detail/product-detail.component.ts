import { Component, OnInit } from '@angular/core';
import { Router , ActivatedRoute} from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {

  HEADING: string = "Product info";
  PRODUCT_ID: any = '';
  PRODUCT_PRICE: any = '20';
  PRODUCT_TITLE: string = 'Prodduct title';
  PRODUCT_SUBTITLE: string = 'Product sub title';
  PRODUCT_CONTENT: string = 'Establishing who you are and how you communicate your brand voice will connect and build trust with the people within and outside of your company.'

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    public imageService: ImageService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter (){

    this.PRODUCT_ID = this.activatedRoute.snapshot.params['id'];
    
  }

  navigation() {

    this.router.navigate(['/store-all-product']);
  }

}
