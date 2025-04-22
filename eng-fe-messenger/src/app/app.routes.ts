import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SectionComponent } from './components/section/section.component';
import { MessengerComponent } from './components/messenger/messenger.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: MessengerComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
