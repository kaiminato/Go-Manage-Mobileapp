import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
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
        category_id: 1,
        category_name: 'Nails',
        count:3,
        is_open: false,
        services: [
          {
            id: 1,
            serviceName: 'File and Polish',
            servicePrice: '$25.00',
          },
          {
            id: 2,
            serviceName: 'Callus Peel',
            servicePrice: '$30.00',
          },
          {
            id: 3,
            serviceName: 'Get Colour',
            servicePrice: '$20.00',
          },
        ]
      },
      {
        category_id: 2,
        category_name: 'Waxing',
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

  CATEGORY_LIST: any = [];

  constructor(
    public router: Router,
    private activateRoute: ActivatedRoute,
    public imageService: ImageService,
    private apiData: ApiDataService
  ) { }

  ngOnInit() {}

  async ionViewWillEnter() {
    
    this.ID = this.activateRoute.snapshot.paramMap.get('id');
    console.log('this.ID------', this.ID, this.USER_INFO);
    this.HEADING = "Book with Jade";

    await this.getServiceList();
  }

  async getServiceList() {
    await this.apiData.presentLoading();

    await (await this.apiData.getServiceList()).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();

        if (response.length > 0){

          console.log('services list----', response);

          let categorie_ids = [...new Set(response.map(data => data.categoryId))];
          console.log('categories--------', categorie_ids)

          this.CATEGORY_LIST = [];

          for(let category_id of categorie_ids){

            //console.log('categorie_id--', categorie_id)

            let service_list = response.filter(service => service.categoryId == category_id);
            //console.log('services------', service_list);

            if (service_list.length > 0){

              this.CATEGORY_LIST.push(
                                      {
                                        category_id: category_id,
                                        category_name: service_list[0].categoryName,
                                        is_open: false,
                                        count:service_list.length,
                                        services: service_list
                                      }
                                    );
            }
          }

          console.log('categories_list-----', this.CATEGORY_LIST)

          
        }
      },
      async (error: any) => {
        await this.apiData.dismiss();
        alert(error);
      }
    );
  }

  changeServiceStatus (service_id: any , status){

    this.CATEGORY_LIST[service_id].is_open = !status ;
    
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/make-a-booking']);
  }

}
