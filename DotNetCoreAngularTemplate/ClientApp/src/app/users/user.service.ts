import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  baseUrl: string;
  apiUrl = 'api/Users/';
  authorizedUser$: Subject<AuthorizedUser> = new Subject<AuthorizedUser>();

  constructor(private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    @Inject('BASE_URL') baseUrl: string,
    private router: Router) {
    this.baseUrl = baseUrl;
  }

  formRegisterModel = this.formBuilder.group(
    {
      Email: ['', Validators.email],
      Passwords: this.formBuilder.group(
        {
          Password: ['', [Validators.required, Validators.minLength(4)]],
          ConfirmPassword: ['', Validators.required]
        },
        {
          validator: this.comparePasswords
        })
    });

  register() {
    const body = {
      Email: this.formRegisterModel.value.Email,
      Password: this.formRegisterModel.value.Passwords.Password
    };
    return this.httpClient.post(this.baseUrl + this.apiUrl + 'Register', body);
  }

  login(user) {
    this.authorizedUser$.next({
      Email: ''
    });
    this.httpClient.post(this.baseUrl + this.apiUrl + 'Login', user).subscribe(
      (res: any) => {
        this.authorizedUser$.next({
          Email: JSON.parse(window.atob((res.token.split('.')[1]))).Email
        });
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('/');
      });
  }

  logout() {
    this.authorizedUser$.next(undefined);
    localStorage.removeItem('token');
    this.router.navigateByUrl('/');
  }

  authorizedUser() {
    return localStorage.getItem('token') != null;
  }

  getAuthorizedUserInfo() {
    //const token = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('token') });
    //return this.httpClient.get(this.baseUrl + this.apiUrl + 'GetAuthorizedUserInfo', { headers: token });
    return this.httpClient.get(this.baseUrl + this.apiUrl + 'GetAuthorizedUserInfo');
  }

  getAuthorizedUserEmail() {
    if (localStorage.getItem('token')) {
      return JSON.parse(window.atob(localStorage.getItem('token'.split('.')[1]))).Email;
    }
    else {
      return '';
    }
  }

  comparePasswords(formBuilder: FormGroup) {
    const confirmPassword = formBuilder.get('ConfirmPassword');
    if (confirmPassword.errors == null || 'passwordMismatch' in confirmPassword.errors) {
      if (formBuilder.get('Password').value != confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
      }
      else {
        confirmPassword.setErrors(null);
      }
    }
  }
}

export interface AuthorizedUser {
  Email: string;
}
