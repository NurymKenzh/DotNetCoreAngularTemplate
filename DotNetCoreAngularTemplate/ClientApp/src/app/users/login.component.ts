import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "./user.service";

@Component({
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
  formLoginModel = {
    Email: '',
    Password: ''
  }

  constructor(private userService: UserService,
    private router: Router) {
  }

  ngOnInit() {
    if (localStorage.getItem('token') != null) {
      this.router.navigateByUrl('/');
    }
  }

  login(form: NgForm) {
    this.userService.login(form.value);
  }
}
