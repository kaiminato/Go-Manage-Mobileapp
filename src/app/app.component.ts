import { Component } from '@angular/core';
import { DataService } from './services/data.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private dataService: DataService,
    private platform: Platform) {
    

      this.platform.ready().then(() => {
        if (this.platform.is('android')) {
         // alert('android');
        } else if (this.platform.is('ios')) {
          ///alert('ios');
        } else {
             //fallback to browser APIs or
             //alert('The platform is not supported');
               }
        });

    this.dataService._getOwnerColor();
  }
}
