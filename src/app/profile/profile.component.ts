import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { AuthService } from '@auth0/auth0-angular';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  HEADING: string = "My Profile";
  IS_PROFILE_SCREEN: boolean = true;
  EDIT_PROFILE: boolean = false;
  PROFILE_HEADER: any = {is_profile: this.IS_PROFILE_SCREEN , edit_profile: this.EDIT_PROFILE}
  SHORT_NAME: string = 'JA';
  FIRST_NAME: string = 'Aonghus';
  LAST_NAME: string = 'Tierney';
  GENDER: string = 'MALE';
  BIRTHDAY: string = '19 Sept 1990';
  ABOUT_ME: string = '';
  UNIT_OF_MEASURE: string = 'Imperial/U.S.';
  HEIGHT: string = '';
  WEIGHT: string = '';
  EMAIL: string = 'Aonghusctierney@gmail.com';
  HOME_LOCATION: string = 'Galway';
  RESPONSE: any;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public auth: AuthService,
  ) { }


  async ngOnInit() {
    //console.log('getting user --', await this.auth.getUser())
  }

  async ionViewWillEnter () {

    await this._getUserInfo();
  }

  async _getUserInfo (){

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => {

        console.log('auth response', response);

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {

            await this.apiData.dismiss();

            console.log('user_info', user_info)
            this.RESPONSE = user_info[0];
            let user_details = user_info[0]

            let name_array = user_details.name.split(' ');

            if (name_array.length >1) {

              this.SHORT_NAME = name_array[0].charAt(0).toUpperCase() +""+ (name_array[1] ? name_array[1].charAt(0).toUpperCase() : '');
            } else {
              this.SHORT_NAME = name_array[0].charAt(0).toUpperCase();
            }



            this.EMAIL = user_details.email;
            //this.GENDER = user_details.user_metadata.gender
            this.BIRTHDAY = user_details.user_metadata.dob;
            this.ABOUT_ME = user_details.user_metadata.aboutMe;
            this.UNIT_OF_MEASURE = user_details.user_metadata.unitOfMeasure;
            this.HEIGHT = user_details.user_metadata.height;
            this.WEIGHT = user_details.user_metadata.weight;
            //this.HOME_LOCATION = '';
            
            
            
          },
          async (error: any) => {

            await this.apiData.dismiss();
            await this.apiData.presentAlert('Get profile api error'+ JSON.stringify(error))
            console.log('get user info error', error)
          }
        );

      },
      async (error:any) => {
        await this.apiData.dismiss();
        console.log('auth error ', error)
        await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    )
  }

  async showForm (){
    this.EDIT_PROFILE = true;
    this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE
  }

  async updateUser() {

   

    if (this.FIRST_NAME.trim() == ''){

      await this.apiData.presentAlert("First name can't be empty")
      return
    }

    if (this.LAST_NAME.trim() == ''){

      await this.apiData.presentAlert("Last name can't be empty")
      return
    }

    if (this.GENDER.trim() == ''){

      await this.apiData.presentAlert("Gender can't be empty")
      return
    }
    

    if (this.BIRTHDAY.trim() == ''){

      await this.apiData.presentAlert("Birthday can't be empty")
      return
    }

    if (this.ABOUT_ME.trim() == ''){

      await this.apiData.presentAlert("Abiut me can't be empty")
      return
    }

    if (this.UNIT_OF_MEASURE.trim() == ''){

      await this.apiData.presentAlert("UNIT_OF_MEASURE can't be empty")
      return
    }

    if (this.HEIGHT == ''){

      await this.apiData.presentAlert("Height can't be empty")
      return
    }

    if (this.WEIGHT == ''){

      await this.apiData.presentAlert("Weight can't be empty")
      return
    }

    if (this.HOME_LOCATION.trim() == ''){

      await this.apiData.presentAlert("Home location can't be empty")
      return
    }

    // this.EDIT_PROFILE = false;
    // this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE;
    // await this.apiData.presentAlert("Profile updated successfully")
    // console.log('user updated')
    let data = [   
      {
         "op": "replace",
         "path": "/email",
         "value": "test@gmail.com"
     },
     {
         "op": "replace",
         "path": "/name",
         "value": "Tom Jones Jr."
     },{
         "op": "replace",
         "path": "/nickname",
         "value": "TommyJr"
     },
     {
         "op": "replace",
         "path": "/user_metadata/addresses/0",
         "value": "{work_addresses:200 Industrial Way}, {home_address:200 suburbs Way}"
     },
     {
         "op": "replace",
         "path": "/user_metadata/gender",
         "value": "{work_addresses:200 Industrial Way}, {home_address:200 suburbs Way}"
     },
     {
         "op": "replace",
         "path": "/user_metadata/height",
         "value": 102.03
     }
 
  ];

    (await this.apiData.updateProfile(data)).subscribe(
      (response: any) => {

        console.log('getting data after update')
      },
      (error: any) => {
        console.log('error during updating profile')
      }
    );

  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
