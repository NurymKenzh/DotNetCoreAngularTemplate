import { Component, OnInit } from "@angular/core";
import { UserService } from "./user.service";

@Component({
  templateUrl: './register.component.html'
})

export class RegisterComponent implements OnInit {
  constructor(public userService: UserService) { }

  ngOnInit() {
    this.userService.formRegisterModel.reset();
  }

  register() {
    this.userService.register().subscribe(
      (res: any) => {
        if (res.succeeded) {
          this.userService.formRegisterModel.reset();
          alert('New user registered!');
        }
        else {
          res.errors.forEach(error => {
            console.log(error.description);
          })
        }
      });
  }
}
