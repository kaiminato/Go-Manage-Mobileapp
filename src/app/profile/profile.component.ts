import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { AuthService } from '@auth0/auth0-angular';

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
  
  FIRST_NAME: string = 'Aonghus';
  LAST_NAME: string = 'Tierney';
  GENDER: string = 'MALE';
  BIRTHDAY: string = '19 Sept 1990';
  ABOUT_ME: string = '';
  UNIT_OF_MEASURE: string = 'Imperial/U.S.';
  HEIGHT: any = '';
  WEIGHT: any = '';
  EMAIL: string = 'Aonghusctierney@gmail.com';
  HOME_LOCATION: string = 'Galway';

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public auth: AuthService,
  ) { }


  async ngOnInit() {
    //console.log('getting user --', await this.auth.getUser())
  }

  ionViewWillEnter () {

  }

  async showForm (){
    this.EDIT_PROFILE = true;
    this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE
  }

  updateUser() {

    this.EDIT_PROFILE = false;
    this.PROFILE_HEADER.edit_profile = this.EDIT_PROFILE;

    console.log('user updated')
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
