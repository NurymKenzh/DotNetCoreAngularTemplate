import { Component, OnInit } from '@angular/core';
import { AuthorizedUser, UserService } from '../users/user.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  isExpanded = false;
  authorizedUser: AuthorizedUser;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.authorizedUser$.subscribe((authorizedUser: AuthorizedUser) => {
      this.authorizedUser = authorizedUser;
    });
    if (localStorage.getItem('token')) {
      this.authorizedUser = {
        Email: this.userService.getAuthorizedUserEmail()
      };
    }
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
