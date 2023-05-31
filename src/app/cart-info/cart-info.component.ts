import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

  // PRODUCT_LIST: any = [
  //                       {id: 1 , name: 'Nike Shoe' , price: 24 , count: 1 , image: this.imageService.SHOE},
  //                       {id: 2 , name: 'Ladies beg' , price: 24 , count: 1 , image: this.imageService.BEG},
  //                     ];
  productIdArr: any = [];
  PRODUCT_LIST: any = [];
  PRODUCT_RESPONSE: any = [];
  isEmptyCart: boolean = false;
  SUB_TOTAL: any = 0;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    public imageService: ImageService,
    private location: Location,
  ) { }

  ngOnInit() {}
  async ionViewWillEnter (){
    this.productIdArr = this.activatedRoute.snapshot.paramMap.get('productIdArr').split(',');
    await this._getProducts();
    console.log("this is",this.productIdArr);
    for(let productId of this.productIdArr){
      console.log('...',productId);
    }
  }

  async _getProducts() {
    await this.apiData.presentLoading();
    await (await this.apiData._getProducts()).subscribe(
      async (response: any ) => {
        await this.apiData.dismiss();
        this.PRODUCT_RESPONSE = response;

        for(let productId of this.productIdArr){
          let get_product =  await this.PRODUCT_RESPONSE.filter( data => data.id == Number(productId));
          if (get_product.length > 0) {
            get_product = get_product[0];
            get_product['no_of_item'] = 0;
            this.PRODUCT_LIST.push(get_product);
          }
        }
        if(!this.PRODUCT_LIST){
          this.isEmptyCart = true;
        }
      },
      async (error: any) => {
        await this.apiData.dismiss();
        this.isEmptyCart = true;
        console.log("this is error",error);
      }
    );
  }

  async _cartProductItemChange (index: any , value_type: string) {

    this.PRODUCT_LIST[index]['no_of_item'] = value_type == 'increment' ? ++this.PRODUCT_LIST[index]['no_of_item'] : --this.PRODUCT_LIST[index]['no_of_item'];
    this._calculatePrice();
  }

  async _calculatePrice () {

    this.SUB_TOTAL = 0;
    for (let value of this.PRODUCT_LIST) this.SUB_TOTAL += (value.price * value.no_of_item);

    this.SUB_TOTAL = this.SUB_TOTAL.toFixed(2);
    console.log('cartt to add----' , this.PRODUCT_LIST);
  }



  navigation() {

    this.location.back();
  }

}
