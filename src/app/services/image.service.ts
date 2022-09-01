import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  public LOGO: string = '../assets/images/logo.png';
  public DEFAULT_PERSON: string = '../assets/images/default-person.png';
  constructor() { }
}
