import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { UserService } from "../users/user.service";

@Injectable({
  providedIn: 'root'
})

export class AuthorizeGuard implements CanActivate {

  constructor(private router: Router,
    private userService: UserService) { }

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    if (localStorage.getItem('token') != null) {
      const allowedRoles = activatedRouteSnapshot.data['allowedRoles'] as Array<string>;
      if (allowedRoles) {
        if (this.userService.allowedRole(allowedRoles)) {
          return true;
        }
        else {
          this.router.navigate(['/user/login']);
          return false;
        }
      }
      return true;
    }
    else {
      this.router.navigate(['/user/login']);
      return false;
    }
  }
}
