import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RoughBoxDirective } from '../../../directives/rough-box.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RoughBoxDirective, RouterModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/chat']);
    }, 1500);
  }
}
