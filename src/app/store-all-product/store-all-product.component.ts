import { Component, OnInit , ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { IonSlides} from '@ionic/angular';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-store-all-product',
  templateUrl: './store-all-product.component.html',
  styleUrls: ['./store-all-product.component.scss'],
})
export class StoreAllProductComponent implements OnInit {


  @ViewChild('mySlider')  slides: IonSlides;


  HEADING: string = "Online Store";
  SELECTED_CATEGORY: string = '';
  SELECTED_CATEGORY_ID: number = 0;
  CATEGORY_TAGS: any =  [
                          { id: 0 , name: "All" , status: true },
                          { id: 1 , name: "Shoes" , status: false },
                          { id: 2 , name: "T-shirt" , status: false },
                        ];

  // PRODUCT_LIST: any = [
  //                       { id: 1 , image: this.imageService.PRODUCT_ONE , description: 'lorem ipsum' , rating: 3.5 , price: 40},
  //                       { id: 2 , image: this.imageService.PRODUCT_TWO , description: 'lorem ipsum' , rating: 4.5 , price: 20},
  //                       { id: 3 , image: this.imageService.PRODUCT_ONE , description: 'lorem ipsum' , rating: 5 , price: 70},
  //                       { id: 4 , image: this.imageService.PRODUCT_TWO , description: 'lorem ipsum' , rating: 3.5 , price: 30},
  //                       { id: 5 , image: this.imageService.PRODUCT_ONE , description: 'lorem ipsum' , rating: 2 , price: 20},
  //                       { id: 6 , image: this.imageService.PRODUCT_TWO , description: 'lorem ipsum' , rating: 3.5 , price: 40},
  //                     ];
  PRODUCT_LIST: any = [];
  PRODUCT_RESPONSE: any = [];
  productIdArr: any = [];
  cart_num: number = 0;


  slideOpts: any = {
    slidesPerView: 5,
    initialSlide: 0,
    speed: 400,
    loop: false,
    // autoplay: {
    //       delay: 4000,
    //       stopOnLastSlide: true
    // }
  };

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    private imageService: ImageService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter (){

    await this.getSelectedcategory();
    await this._getProducts();
  }

  async selectCategory (index : any) {

    this.CATEGORY_TAGS.map( data => data.status = false);
    this.CATEGORY_TAGS[index].status = true;
    this.slides.slideTo(index,2000);
    await this.getSelectedcategory();
  }

  async getSelectedcategory () {

    let active_category = this.CATEGORY_TAGS.filter(data => data.status == true);
    this.SELECTED_CATEGORY = active_category.length > 0 ? active_category[0].name : '';
    this.SELECTED_CATEGORY_ID = active_category.length > 0 ? active_category[0].id : 0;
    this.PRODUCT_LIST =  this.SELECTED_CATEGORY_ID !=0 ?  await this.PRODUCT_RESPONSE.filter( data => data.brandId == this.SELECTED_CATEGORY_ID) : this.PRODUCT_RESPONSE;
  }

  navigation() {

    this.router.navigate(['/']);
  }

  async _getProducts() {
    await this.apiData.presentLoading();
    await (await this.apiData._getProducts()).subscribe(
      async (response: any ) => {
        await this.apiData.dismiss();
        for(let response_item of response){
          response_item['isActive'] = false;
        }
        this.PRODUCT_LIST = response;
        this.PRODUCT_RESPONSE = response;
        console.log("this is product list",response);
      },
      async (error: any) => {
        await this.apiData.dismiss();
        console.log("this is error",error);
      }
    );
  }
  async onSearch(SEARCH_TEXT: string) {
      this.PRODUCT_LIST = await this.PRODUCT_RESPONSE.filter( data =>
        ((data.name.toLocaleLowerCase()).indexOf(SEARCH_TEXT.toLocaleLowerCase()) != -1)
        ||
        ((data.description.toLocaleLowerCase()).indexOf(SEARCH_TEXT.toLocaleLowerCase()) != -1)
        );
  }

  async addCart (productId: any) {
    let is_exist_in_cart = await this.productIdArr.filter(data => data == productId);
    if (is_exist_in_cart.length  == 0){
      this.productIdArr.push(productId);
      this.cart_num++;
      console.log("cart_num",this.cart_num);
    }

    for(let product of this.PRODUCT_LIST){
      if(product.id == productId){
        product.isActive = true;
      }
    }
  }

}
