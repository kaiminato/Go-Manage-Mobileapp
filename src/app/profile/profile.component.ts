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
        //response.email = 'gomanageTest@gmail.com';
        this.EMAIL = response.email;

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {

            await this.apiData.dismiss();

            console.log('user_info', user_info)
            this.RESPONSE = user_info;
            let user_details = user_info

            let name_array = user_details.name.split(' ');

            if (user_details.givenName == 'null' && user_details.familyName == 'null'){

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
            } else {
              
              this.SHORT_NAME = (<any> Array.from(user_details.givenName)[0]).toUpperCase() +""+(<any> Array.from(user_details.familyName)[0]).toUpperCase();
              this.FIRST_NAME = user_details.givenName;
              this.LAST_NAME = user_details.familyName;
            }

            

            if (user_details?.user_metadata) {

              let [date , month , year] = user_details.user_metadata.dob.split('/')


              this.EMAIL = user_details.email;
              this.GENDER = user_details.user_metadata.gender.toUpperCase()
              this.BIRTHDAY = `${year}-${month}-${date}`;
              this.ABOUT_ME = user_details.user_metadata.aboutMe;
              this.UNIT_OF_MEASURE = user_details.user_metadata.unitOfMeasure;
              this.HEIGHT = user_details.user_metadata.height;
              this.WEIGHT = user_details.user_metadata.weight;
              let address_value = JSON.parse(user_details.user_metadata?.addresses[0])
              this.HOME_LOCATION = address_value?.work_address;

            }
            
            
            
            
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

    

    if (this.HOME_LOCATION.trim() == ''){

      await this.apiData.presentAlert("Home location can't be empty")
      return
    }

    let [year , month , date] = this.BIRTHDAY.split('-');
    let D_O_B = `${date}/${month}/${year}`;

    let dat = {
      gender: this.GENDER,
      birth: D_O_B,
      HOME_LOCATION: this.HOME_LOCATION
    }

    console.log('my data' , dat)
   

    // this.EDIT_PROFILE = false;
    // this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE;
    // await this.apiData.presentAlert("Profile updated successfully")
    // console.log('user updated')

    let data = {
      // email: this.EMAIL,
      givenName: this.FIRST_NAME,
      familyName: this.LAST_NAME,
      //name: `${this.FIRST_NAME} ${this.LAST_NAME}`,
      user_metadata : {
        //addresses : this.HOME_LOCATION,
        addresses: {
          work_address: this.HOME_LOCATION
        },
        gender: this.GENDER,
        dob: D_O_B,
      }
    }
  //   let data = [
  //     {
  //       "op": "replace",
  //       "path": "/name",
  //       "value": this.FIRST_NAME+' '+this.LAST_NAME
  //     }, 
  //     {
  //       "op": "replace",
  //       "path": "/user_metadata/addresses/0",
  //       "value": this.HOME_LOCATION
  //     },
  //     {
  //         "op": "replace",
  //         "path": "/user_metadata/gender",
  //         "value": this.GENDER
  //     },
  //     {
  //         "op": "replace",
  //         "path": "/user_metadata/height",
  //         "value": this.HEIGHT
  //     },
  //     {
  //         "op": "replace",
  //         "path": "/user_metadata/weight",
  //         "value": this.WEIGHT
  //     },
  //     {
  //       "op": "replace",
  //       "path": "/user_metadata/unitOfMeasure",
  //       "value": this.UNIT_OF_MEASURE
  //     },
  //     {
  //         "op": "replace",
  //         "path": "/user_metadata/aboutMe",
  //         "value": this.ABOUT_ME
  //     },
  //   // {
  //   //   "op": "replace",
  //   //   "path": "/user_metadata/dob",
  //   //   "dob": D_O_B
  //   // }
  // ];

  console.log('jsonparse' , JSON.stringify(data))

  await this.apiData.presentLoading();

    (await this.apiData.updateProfile(data , this.EMAIL)).subscribe(
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
