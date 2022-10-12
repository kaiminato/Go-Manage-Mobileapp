import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  public LOGO: string = '../assets/images/logo.png';
  public DEFAULT_PERSON: string = '../assets/images/default-person.png';
  public PRODUCT_ONE: string = '../assets/images/product.jpg';
  public PRODUCT_TWO: string = '../assets/images/product_1.jpg';
  public SHOE: string = '../assets/images/shoe.jpeg';
  public BEG: string = '../assets/images/beg.jpeg';
  constructor() { }
}
