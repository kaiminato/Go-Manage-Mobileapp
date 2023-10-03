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
  PRODUCT_IMG: any;
  PRODUCT_PRICE: any = '';
  PRODUCT_NAME: string = '';
  PRODUCT_DESCRIPTION: string = '';
  PRODUCT_LIST: any = [];
  PRODUCT_RESPONSE: any = [];
  PRODUCT_Detail_ARR: any = [];
  PRODUCT_Detail: any = {};
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
    await this._getProducts();
  }
  async _getProducts() {
    await this.apiData.presentLoading();
    await (await this.apiData._getProducts()).subscribe(
      async (response: any ) => {
        await this.apiData.dismiss();
        this.PRODUCT_LIST = response;
        this.PRODUCT_RESPONSE = response;
        console.log("this is product list", this.PRODUCT_RESPONSE);
        this.PRODUCT_Detail_ARR =  await this.PRODUCT_RESPONSE.filter( data => data.id == Number(this.PRODUCT_ID));
        this.PRODUCT_Detail = this.PRODUCT_Detail_ARR[0];
        console.log("this is product detail",this.PRODUCT_Detail);
        this.PRODUCT_IMG = this.PRODUCT_Detail.image;
        this.PRODUCT_PRICE = this.PRODUCT_Detail.price;
        this.PRODUCT_NAME = this.PRODUCT_Detail.name;
        this.PRODUCT_DESCRIPTION = this.PRODUCT_Detail.description;
      },
      async (error: any) => {
        await this.apiData.dismiss();
        console.log("this is error",error);
      }
    );
  }
  navigation() {

    this.router.navigate(['/store-all-product']);
  }

}
