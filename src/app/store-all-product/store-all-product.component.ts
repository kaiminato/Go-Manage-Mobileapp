import { Component, OnInit , ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { IonSlides} from '@ionic/angular';

@Component({
  selector: 'app-store-all-product',
  templateUrl: './store-all-product.component.html',
  styleUrls: ['./store-all-product.component.scss'],
})
export class StoreAllProductComponent implements OnInit {


  @ViewChild('mySlider')  slides: IonSlides;


  HEADING: string = "Select a product";
  SELECTED_CATEGORY: string = '';
  CATEGORY_TAGS: any =  [
                          { id: 1 , name: "Men" , status: false },
                          { id: 2 , name: "WoMen" , status: true },
                          { id: 3 , name: "Kids" , status: false },
                          { id: 4 , name: "Test" , status: false },
                          { id: 5 , name: "Test 1" , status: false },
                          { id: 6 , name: "Test 2" , status: false },
                          { id: 6 , name: "" , status: false },
                        ];

            

  slideOpts: any = {
    slidesPerView: 4,
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
    private dataService: DataService
  ) { }

  ngOnInit() {}

  async ionViewWillEnter (){

    await this.getSelectedcategory()

  }

  async selectCategory (index : any) {

    this.CATEGORY_TAGS.map( data => data.status = false);
    this.CATEGORY_TAGS[index].status = true;
    this.slides.slideTo(index,2000);
    await this.getSelectedcategory()
  }

  async getSelectedcategory () {

    let active_category = this.CATEGORY_TAGS.filter(data => data.status == true);
    this.SELECTED_CATEGORY = active_category.length > 0 ? active_category[0].name : '';
  }


  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
