import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Component({
  selector: 'users',
  templateUrl: 'list.component.html'
})

export class UsersListComponent implements OnInit, AfterViewInit {
  columns: string[] = ['Email', 'Roles'];
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private userService: UserService) {
    this.dataSource.filterPredicate = (user: User, filter: string) => {
      return user.Email.toLowerCase().includes(filter.toLowerCase()) ||
        user.Roles.join('').toLowerCase().includes(filter.toLowerCase());
    }
  }

  ngOnInit() {
    this.get();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public get() {
    this.userService.get()
      .subscribe(res => {
        this.dataSource.data = res as User[];
      });
  }

  public filter(filter: string) {
    this.dataSource.filter = filter.trim().toLowerCase();
  }
}
