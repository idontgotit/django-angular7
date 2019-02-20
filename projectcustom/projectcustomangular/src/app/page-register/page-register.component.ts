import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from "@angular/router"
import {HttpClient} from '@angular/common/http';
import {map} from "rxjs/internal/operators";
import {AuthenticationService} from "../api.service";
import {first} from 'rxjs/operators';
// import custom validator to validate that password and confirm password fields match

@Component({
  selector: 'app-page-register',
  templateUrl: './page-register.component.html',
  styleUrls: ['./page-register.component.scss']
})
export class PageRegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  REGISTER_URL = 'http://127.0.0.1:8000/custom_sale/create_client_user';

  constructor(private formBuilder: FormBuilder, private router: Router, private http: HttpClient, private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    let current_user = localStorage.getItem('user');
    let is_staff = localStorage.getItem('is_staff');
    let data = this.registerForm.value;
    if (is_staff){
      data.current_admin_id = current_user
    }
    this.authenticationService.create_user(data)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['accounting']);
        },
        error => {
          // this.alertService.error(error);
        });
    // this.router.navigate(['accounting']);
    // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value))
  }
}


// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({mustMatch: true});
    } else {
      matchingControl.setErrors(null);
    }
  }
}
