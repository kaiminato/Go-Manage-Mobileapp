import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-profile',
  //templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  HEADING: string = "My Profile";
  
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public auth: AuthService,
  ) { }


  async ngOnInit() {
    console.log('getting user --', await this.auth.getUser())
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
