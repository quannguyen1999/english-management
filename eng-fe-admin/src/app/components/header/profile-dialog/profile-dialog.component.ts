import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../../models/model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './profile-dialog.component.html'
})
export class ProfileDialogComponent  implements OnInit {
  profileForm: FormGroup;
  userName: string = '';
  userRole: string = '';
  userStatus = 'ACTIVE';

  constructor(
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        this.userName = decodedToken.user || decodedToken.sub || 'User';
        this.userRole = decodedToken.authorities?.[0] || 'USER';
        
        // Initialize form with current username
        this.profileForm.patchValue({
          username: this.userName
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
      this.dialogRef.close(this.profileForm.value);
    }
  }
} 