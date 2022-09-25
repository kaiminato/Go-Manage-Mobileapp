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

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
