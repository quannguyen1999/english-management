import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RoughBoxDirective } from '../../directives/rough-box.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule,
    RoughBoxDirective
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;

  onLogin() {
    console.log('Login attempt', {
      username: this.username,
      password: this.password,
      rememberMe: this.rememberMe
    });
  }
}
