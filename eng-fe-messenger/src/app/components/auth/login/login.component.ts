import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';
import { LoginService } from '../../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoginRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RoughBoxDirective, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is already logged in
    if (localStorage.getItem('token')) {
      this.loginService.redirectToChat();
    }
  }

  onSubmit(): void {
    if (this.isLoading) return;
    
    if (!this.email || !this.password) {
      this.toastr.warning(
        this.translate.instant('LOGIN.ENTER_CREDENTIALS'),
        this.translate.instant('LOGIN.WARNING')
      );
      return;
    }

    this.isLoading = true;
    const credentials: LoginRequest = {
      username: this.email,
      password: this.password
    };
    
    this.loginService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        this.isLoading = false;
        this.password = ''; // Clear password on error
        console.error('Login failed:', error);
      }
    });
  }
}
