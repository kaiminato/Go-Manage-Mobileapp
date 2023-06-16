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
  PROFILE_HEADER: any = { is_profile: this.IS_PROFILE_SCREEN, edit_profile: this.EDIT_PROFILE }
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
  PHONE: string = '';
  RESPONSE: any;
  USERGMID: any;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public auth: AuthService,
  ) { }



  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }


  async ngOnInit() {

  }

  async ionViewWillEnter () {

    await this.apiData._updateUserId();
    await this._getUserInfo();
  }

  async _getUserInfo (){

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => {

        response.email = response.email.toLowerCase();

        this.EMAIL = response.email;

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {

            await this.apiData.dismiss();
            console.log("user_info",user_info);
            this.RESPONSE = user_info;
            let user_details = user_info;


            if (user_details.givenName == 'null' && user_details.familyName == 'null'){

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
            } else {


              if (user_details.hasOwnProperty('givenName')) {

                this.SHORT_NAME = (<any> Array.from(user_details.givenName)[0]).toUpperCase() +""+(<any> Array.from(user_details.familyName)[0]).toUpperCase();
                this.FIRST_NAME = user_details.givenName;
                this.LAST_NAME = user_details.familyName;
              } else if (!user_details.hasOwnProperty('name')) {

                this.SHORT_NAME = (<any> Array.from(user_details.email)[0]).toUpperCase();
              } else {
                this.SHORT_NAME = (<any> Array.from(user_details.name)[0]).toUpperCase();
                this.FIRST_NAME = user_details.name;
              }
            }
            this.USERGMID = user_details.userGMID;
            this.PHONE = user_details.phoneMobile;
            this.BIRTHDAY = user_details.dateOfBirth;
            this.GENDER = user_details.gender.toUpperCase();
            // if (user_details?.user_metadata) {
            //   let [date , month , year] = user_details.user_metadata.dob.split('/')
            //   this.EMAIL = user_details.email;
            //   this.GENDER = user_details.user_metadata.gender.toUpperCase()
            //   this.BIRTHDAY = `${year}-${month}-${date}`;
            //   this.ABOUT_ME = user_details.user_metadata.aboutMe;
            //   this.UNIT_OF_MEASURE = user_details.user_metadata.unitOfMeasure;
            //   this.HEIGHT = user_details.user_metadata.height;
            //   this.WEIGHT = user_details.user_metadata.weight;
            //   let address_value = JSON.parse(user_details.user_metadata?.addresses[0])
            //   this.HOME_LOCATION = address_value?.work_address;
            // }
          },
          async (error: any) => {

            await this.apiData.dismiss();
            await this.apiData.presentAlert('Get profile api error'+ JSON.stringify(error))

          }
        );

      },
      async (error:any) => {
        await this.apiData.dismiss();

        await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    )
  }

  async showForm (){
    this.EDIT_PROFILE = true;
    this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE
  }

  async updateUser() {

    if (this.FIRST_NAME == ''){

      await this.apiData.presentAlert("First name can't be empty")
      return
    }

    if (this.LAST_NAME == ''){

      await this.apiData.presentAlert("Last name can't be empty")
      return
    }

    if (this.GENDER == ''){

      await this.apiData.presentAlert("Gender can't be empty")
      return
    }

    if (this.PHONE == ''){

      await this.apiData.presentAlert("Phone can't be empty")
      return
    }

    if (this.BIRTHDAY == ''){

      await this.apiData.presentAlert("Birthday can't be empty")
      return
    }

    // if (this.HOME_LOCATION == ''){

    //   await this.apiData.presentAlert("Home location can't be empty")
    //   return
    // }

    // let [year , month , date] = this.BIRTHDAY.split('-');
    // let D_O_B = `${date}-${month}-${year}`;

    // let dat = {
    //   gender: this.GENDER,
    //   birth: D_O_B,
    //   HOME_LOCATION: this.HOME_LOCATION
    // }

    let data = {
      email: this.EMAIL,
      givenName: this.FIRST_NAME,
      familyName: this.LAST_NAME,
      phoneMobile: this.PHONE.toString(),
      // address: this.HOME_LOCATION,
      gender: this.GENDER,
      dateOfBirth: this.BIRTHDAY,
      userGMID: this.USERGMID,
    }

  await this.apiData.presentLoading();

    (await this.apiData.updateProfile(data)).subscribe(
      async (response: any) => {
        await this.apiData.dismiss();
        await this.apiData.presentAlert('Profile updated successfully');
        this.EDIT_PROFILE = false;
        this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE;
      },
      async (error: any) => {
        if(error.status === 200){
          await this.apiData.dismiss();
          await this.apiData.presentAlert('Profile updated successfully');
          this.EDIT_PROFILE = false;
          this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE;
        }
        else{
          await this.apiData.dismiss();
          await this.apiData.presentAlert('Server error, Please try again later');
        }
      }
    );

  }

  navigation() {

    this.router.navigate(['/']);
  }

}
