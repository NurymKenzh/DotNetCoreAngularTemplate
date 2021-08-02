import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Component({
  templateUrl: 'details.component.html'
})

export class UserDetailsComponent implements OnInit {
  public user: User;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private service: UserService) { }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.service.get(id)
      .subscribe(
        res => {
          this.user = res as User;
        },
        (error => {
          console.log(error);
        }));
  }

  public cancel() {
    this.router.navigateByUrl('/users');
  }
}
