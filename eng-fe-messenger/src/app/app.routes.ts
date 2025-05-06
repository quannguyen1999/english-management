import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.component')
      .then(m => m.ChatComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'chat/:idConversation',
    loadComponent: () => import('./components/chat/chat.component')
      .then(m => m.ChatComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'social',
    loadComponent: () => import('./components/social/social.component')
      .then(m => m.SocialComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./components/social/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/social/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'friends/pending',
    loadComponent: () => import('./components/social/profile/pending-friends/pending-friends.component')
      .then(m => m.PendingFriendsComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: '**',
    redirectTo: 'chat'
  }
];
