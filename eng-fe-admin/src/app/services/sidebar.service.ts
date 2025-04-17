import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isExpandedSubject = new BehaviorSubject<boolean>(false);
  isExpanded$ = this.isExpandedSubject.asObservable();

  setExpanded(isExpanded: boolean): void {
    this.isExpandedSubject.next(isExpanded);
  }
} 