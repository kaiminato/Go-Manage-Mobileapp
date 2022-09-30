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
  SHORT_NAME: string = '';
  FIRST_NAME: string = '';
  LAST_NAME: string = '';
  GENDER: string = '';
  BIRTHDAY: string = '';
  ABOUT_ME: string = '';
  UNIT_OF_MEASURE: string = '';
  HEIGHT: string = '';
  WEIGHT: string = '';
  EMAIL: string = '';
  HOME_LOCATION: string = '';
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
              
              this.LAST_NAME = '';
              this.FIRST_NAME = name_array[0];
              for(let i = 1; i < name_array.length; i++){

                this.LAST_NAME += name_array[i]+ ' ';
              }
            
            } else {
              this.SHORT_NAME = name_array[0].charAt(0).toUpperCase();
              this.FIRST_NAME = name_array[0];
            }

            let [date , month , year] = user_details.user_metadata.dob.split('/')


            this.EMAIL = user_details.email;
            //this.GENDER = user_details.user_metadata.gender
            this.BIRTHDAY = `${year}-${month}-${date}`;
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

    let [year , month , date] = this.BIRTHDAY.split('-');
    let D_O_B = `${date}/${month}/${year}`;

    let dat = {
      gender: this.GENDER,
      birth: D_O_B,
      about: this.ABOUT_ME,
      UNIT_OF_MEASURE: this.UNIT_OF_MEASURE,
      HEIGHT: this.HEIGHT,
      WEIGHT: this.WEIGHT,
      HOME_LOCATION: this.HOME_LOCATION
    }

    console.log('my data' , dat)

    // this.EDIT_PROFILE = false;
    // this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE;
    // await this.apiData.presentAlert("Profile updated successfully")
    // console.log('user updated')
    let data = [
      {
        "op": "replace",
        "path": "/name",
        "value": this.FIRST_NAME+' '+this.LAST_NAME
      }, 
      {
        "op": "replace",
        "path": "/user_metadata/addresses/0",
        "value": this.HOME_LOCATION
      },
      {
          "op": "replace",
          "path": "/user_metadata/gender",
          "value": this.GENDER
      },
      {
          "op": "replace",
          "path": "/user_metadata/height",
          "value": this.HEIGHT
      },
      {
          "op": "replace",
          "path": "/user_metadata/weight",
          "value": this.WEIGHT
      },
      {
        "op": "replace",
        "path": "/user_metadata/unitOfMeasure",
        "value": this.UNIT_OF_MEASURE
      },
      {
          "op": "replace",
          "path": "/user_metadata/aboutMe",
          "value": this.ABOUT_ME
      },
    // {
    //   "op": "replace",
    //   "path": "/user_metadata/dob",
    //   "dob": D_O_B
    // }
  ];

  console.log('jsonparse' , JSON.stringify(data))

  await this.apiData.presentLoading();

    (await this.apiData.updateProfile(data)).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();
        await this.apiData.presentAlert('Profile updated successfully');
        this.EDIT_PROFILE = false;
        this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE
        console.log('getting data after update')
      },
      async (error: any) => {

        await this.apiData.dismiss();
        await this.apiData.presentAlert('Server error, Please try again later');
        console.log('error during updating profile')
      }
    );

  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
