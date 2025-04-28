import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  // Routes where header should be hidden
  private readonly hideHeaderRoutes = ['/login', '/register', '/chat'];
  
  private showHeaderSubject = new BehaviorSubject<boolean>(
    !this.shouldHideHeader(window.location.pathname)
  );
  showHeader$ = this.showHeaderSubject.asObservable();

  constructor(private router: Router) {
    // Subscribe to router events to automatically update header visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeaderSubject.next(!this.shouldHideHeader(event.url));
    });
  }

  private shouldHideHeader(url: string): boolean {
    return this.hideHeaderRoutes.some(route => 
      url === route || url.startsWith(route + '/')
    );
  }

  setHeaderVisibility(show: boolean): void {
    this.showHeaderSubject.next(show);
  }
} 