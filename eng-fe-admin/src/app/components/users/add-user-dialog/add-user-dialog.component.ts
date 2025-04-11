import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateUserDto } from '../../../models/model';
import { TranslationService } from '../../../services/translation.service';
import { DURATION_SNACKBAR } from '../../../constants/configs';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss'],
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
export class AddUserDialogComponent {
  userForm: FormGroup;
  roles = ['ADMIN', 'TEACHER', 'STUDENT'];
  isLoading = false;
  public translationService: TranslationService;

  constructor(
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    translationService: TranslationService
  ) {
    this.translationService = translationService;
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
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
    if (control?.hasError('minlength')) {
      return this.translationService.getTranslation('FORM_MIN_LENGTH').replace('{length}', control.errors?.['minlength'].requiredLength);
    }
    return '';
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isLoading) {
      this.isLoading = true;
      const userData: CreateUserDto = this.userForm.value;

      this.userService.createUser(userData).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
          this.snackBar.open(this.translationService.getTranslation('USER_CREATED'), 'Close', { duration: DURATION_SNACKBAR });
        },
        error: (error) => {
          let errorMessage = this.translationService.getTranslation('USER_CREATE_FAILED');
          if (error.message === 'Username already exists') {
            errorMessage = this.translationService.getTranslation('USERNAME_EXISTS');
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