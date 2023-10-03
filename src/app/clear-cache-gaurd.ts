import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataService } from './services/data.service';

@Injectable({
  providedIn: 'root'
})
export class ClearCacheGuard implements CanActivate {
  constructor(private dataService: DataService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    localStorage.clear();
    sessionStorage.clear();
    return true;
  }
}
