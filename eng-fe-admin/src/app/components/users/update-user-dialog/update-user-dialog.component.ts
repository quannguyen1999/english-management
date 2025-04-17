import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../models/model';
import { TranslationService } from '../../../services/translation.service';
import { DURATION_SNACKBAR } from '../../../constants/configs';

@Component({
  selector: 'app-update-user-dialog',
  templateUrl: './update-user-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ]
})
export class UpdateUserDialogComponent {
  userForm: FormGroup;
  roles = ['ADMIN', 'TEACHER', 'STUDENT'];
  isLoading = false;
  public translationService: TranslationService;

  constructor(
    private dialogRef: MatDialogRef<UpdateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: User,
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    translationService: TranslationService
  ) {
    this.translationService = translationService;
    this.userForm = this.fb.group({
      username: [{ value: data.username, disabled: true }],
      email: [data.email, [Validators.required, Validators.email]],
      role: [data.role, Validators.required]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control?.hasError('required')) {
      return this.translationService.getTranslation('FORM_FIELD_REQUIRED');
    }
    if (control?.hasError('email')) {
      return this.translationService.getTranslation('FORM_INVALID_EMAIL');
    }
    return '';
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isLoading) {
      this.isLoading = true;
      const userData = {
        ...this.userForm.getRawValue()
      };

      this.userService.updateUser(userData).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
          this.snackBar.open(this.translationService.getTranslation('USER_UPDATED'), 'Close', { duration: DURATION_SNACKBAR });
        },
        error: (error) => {
          let errorMessage = this.translationService.getTranslation('USER_UPDATE_FAILED');
          if (error.message === 'Invalid user data') {
            errorMessage = this.translationService.getTranslation('INVALID_USER_DATA');
          } else if (error.message === 'Email already exists') {
            errorMessage = this.translationService.getTranslation('EMAIL_EXISTS');
          }
          this.snackBar.open(errorMessage, 'Close', { duration: DURATION_SNACKBAR });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 