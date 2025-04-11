import { Injectable } from '@angular/core';

export interface Translation {
  [key: string]: {
    [lang: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = 'en';
  private translations: Translation = {
    'REGISTRATION_SUCCESSFUL': {
      'en': 'Registration successful',
      'vi': 'Đăng ký thành công'
    },
    'INVALID_USER_DATA': {
      'en': 'Invalid user data',
      'vi': 'Dữ liệu người dùng không hợp lệ'
    },
    'INVALID_USERNAME_FORMAT': {
      'en': 'Invalid username format',
      'vi': 'Định dạng tên người dùng không hợp lệ'
    },
    'USERNAME_EXISTS': {
      'en': 'Username already exists',
      'vi': 'Tên người dùng đã tồn tại'
    },
    'INVALID_PASSWORD_FORMAT': {
      'en': 'Invalid password format',
      'vi': 'Định dạng mật khẩu không hợp lệ'
    },
    'INVALID_EMAIL_FORMAT': {
      'en': 'Invalid email format',
      'vi': 'Định dạng email không hợp lệ'
    },
    'EMAIL_EXISTS': {
      'en': 'Email already exists',
      'vi': 'Email đã tồn tại'
    },
    'REGISTRATION_FAILED': {
      'en': 'Registration failed',
      'vi': 'Đăng ký thất bại'
    },
    'LOGIN_SUCCESSFUL': {
      'en': 'Login successful',
      'vi': 'Đăng nhập thành công'
    },
    'WRONG_CREDENTIALS': {
      'en': 'Wrong username or password',
      'vi': 'Sai tên đăng nhập hoặc mật khẩu'
    },
    'ERROR_OCCURRED': {
      'en': 'An error occurred',
      'vi': 'Đã xảy ra lỗi'
    },
    'USER_CREATED': {
      'en': 'User created successfully',
      'vi': 'Tạo người dùng thành công'
    },
    'USER_UPDATED': {
      'en': 'User updated successfully',
      'vi': 'Cập nhật người dùng thành công'
    },
    'USER_DELETED': {
      'en': 'User deleted successfully',
      'vi': 'Xóa người dùng thành công'
    },
    'UNAUTHORIZED': {
      'en': 'Unauthorized access',
      'vi': 'Truy cập không được phép'
    },
    'HEADER_NOTIFICATIONS': {
      'en': 'NOTIFICATIONS',
      'vi': 'THÔNG BÁO'
    },
    'HEADER_NO_NOTIFICATIONS': {
      'en': 'No notifications at this time',
      'vi': 'Không có thông báo nào'
    },
    'HEADER_ACCOUNT': {
      'en': 'ACCOUNT',
      'vi': 'TÀI KHOẢN'
    },
    'HEADER_SETTINGS': {
      'en': 'SETTINGS',
      'vi': 'CÀI ĐẶT'
    },
    'HEADER_PROFILE': {
      'en': 'Profile',
      'vi': 'Hồ sơ'
    },
    'HEADER_LOGOUT': {
      'en': 'Log out',
      'vi': 'Đăng xuất'
    },
    'HEADER_CONTACT_ME': {
      'en': 'Feel free to contact me:',
      'vi': 'Liên hệ với tôi:'
    },
    'HEADER_PHONE': {
      'en': 'Phone:',
      'vi': 'Điện thoại:'
    },
    'HEADER_EMAIL': {
      'en': 'Email:',
      'vi': 'Email:'
    },
    'CHART_TASK_PROGRESS': {
      'en': 'Task Progress Over Time',
      'vi': 'Tiến độ công việc theo thời gian'
    },
    'CHART_TASKS_COMPLETED': {
      'en': 'Tasks Completed',
      'vi': 'Công việc đã hoàn thành'
    },
    'CHART_TASKS_IN_PROGRESS': {
      'en': 'Tasks In Progress',
      'vi': 'Công việc đang thực hiện'
    },
    'CHART_TASK_DISTRIBUTION': {
      'en': 'Task Distribution',
      'vi': 'Phân bố công việc'
    },
    'CHART_COMPLETED': {
      'en': 'Completed',
      'vi': 'Đã hoàn thành'
    },
    'CHART_IN_PROGRESS': {
      'en': 'In Progress',
      'vi': 'Đang thực hiện'
    },
    'CHART_PENDING': {
      'en': 'Pending',
      'vi': 'Đang chờ'
    },
    'CHART_WEEKLY_WORK_HOURS': {
      'en': 'Weekly Work Hours',
      'vi': 'Giờ làm việc hàng tuần'
    },
    'CHART_HOURS_WORKED': {
      'en': 'Hours Worked',
      'vi': 'Số giờ làm việc'
    },
    'CHART_MONDAY': {
      'en': 'Monday',
      'vi': 'Thứ Hai'
    },
    'CHART_TUESDAY': {
      'en': 'Tuesday',
      'vi': 'Thứ Ba'
    },
    'CHART_WEDNESDAY': {
      'en': 'Wednesday',
      'vi': 'Thứ Tư'
    },
    'CHART_THURSDAY': {
      'en': 'Thursday',
      'vi': 'Thứ Năm'
    },
    'CHART_FRIDAY': {
      'en': 'Friday',
      'vi': 'Thứ Sáu'
    },
    'LOGIN_TO_CONTINUE': {
      'en': 'Log in to continue',
      'vi': 'Đăng nhập để tiếp tục'
    },
    'USERNAME_PLACEHOLDER': {
      'en': 'Enter your username',
      'vi': 'Nhập tên đăng nhập'
    },
    'PASSWORD_PLACEHOLDER': {
      'en': 'Enter your password',
      'vi': 'Nhập mật khẩu'
    },
    'CONTINUE': {
      'en': 'Continue',
      'vi': 'Tiếp tục'
    },
    'CANT_LOGIN': {
      'en': 'Can\'t log in?',
      'vi': 'Không thể đăng nhập?'
    },
    'CREATE_ACCOUNT': {
      'en': 'Create an account',
      'vi': 'Tạo tài khoản'
    },
    'PRIVACY_POLICY': {
      'en': 'Privacy Policy',
      'vi': 'Chính sách bảo mật'
    },
    'USER_NOTICE': {
      'en': 'User Notice',
      'vi': 'Thông báo người dùng'
    },
    'FORM_FIELD_REQUIRED': {
      'en': 'This field is required',
      'vi': 'Trường này là bắt buộc'
    },
    'USERS': {
      'en': 'Users',
      'vi': 'Người dùng'
    },
    'SEARCH_USERS': {
      'en': 'Search Users',
      'vi': 'Tìm kiếm người dùng'
    },
    'CREATE_USER': {
      'en': 'Create User',
      'vi': 'Tạo người dùng'
    },
    'USERNAME': {
      'en': 'Username',
      'vi': 'Tên đăng nhập'
    },
    'EMAIL': {
      'en': 'Email',
      'vi': 'Email'
    },
    'ROLE': {
      'en': 'Role',
      'vi': 'Vai trò'
    },
    'CREATED_AT': {
      'en': 'Created At',
      'vi': 'Ngày tạo'
    },
    'UPDATED_AT': {
      'en': 'Updated At',
      'vi': 'Ngày cập nhật'
    },
    'ACTIONS': {
      'en': 'Actions',
      'vi': 'Thao tác'
    },
    'EDIT_USER': {
      'en': 'Edit user',
      'vi': 'Sửa người dùng'
    },
    'ITEMS_PER_PAGE': {
      'en': 'Items per page',
      'vi': 'Số mục mỗi trang'
    },
    'UPDATE_USER': {
      'en': 'Update User',
      'vi': 'Cập nhật người dùng'
    },
    'UPDATING': {
      'en': 'Updating...',
      'vi': 'Đang cập nhật...'
    },
    'UPDATE': {
      'en': 'Update',
      'vi': 'Cập nhật'
    },
    'CANCEL': {
      'en': 'Cancel',
      'vi': 'Hủy'
    },
    'ROLE_ADMIN': {
      'en': 'Admin',
      'vi': 'Quản trị viên'
    },
    'ROLE_TEACHER': {
      'en': 'Teacher',
      'vi': 'Giáo viên'
    },
    'ROLE_STUDENT': {
      'en': 'Student',
      'vi': 'Học sinh'
    },
    'FORM_INVALID_EMAIL': {
      'en': 'Please enter a valid email address',
      'vi': 'Vui lòng nhập địa chỉ email hợp lệ'
    },
    'FORM_MIN_LENGTH': {
      'en': 'Minimum length is {length} characters',
      'vi': 'Độ dài tối thiểu là {length} ký tự'
    },
    'USER_CREATE_FAILED': {
      'en': 'Failed to create user',
      'vi': 'Tạo người dùng thất bại'
    },
    'USER_UPDATE_FAILED': {
      'en': 'Failed to update user',
      'vi': 'Cập nhật người dùng thất bại'
    }
  };

  setLanguage(lang: string): void {
    this.currentLang = lang;
  }

  getTranslation(key: string): string {
    return this.translations[key]?.[this.currentLang] || key;
  }
} 