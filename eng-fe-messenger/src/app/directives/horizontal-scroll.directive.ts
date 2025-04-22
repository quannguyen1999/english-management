import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[horizontalScroll]',
  standalone: true
})
export class HorizontalScrollDirective {
  constructor(private el: ElementRef) {}

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.deltaY !== 0) {
      event.preventDefault();
      
      // Get the element
      const element = this.el.nativeElement;
      
      // Calculate scroll amount (smooth scrolling)
      const scrollAmount = event.deltaY > 0 ? 60 : -60;
      
      // Smooth scroll
      element.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }
} 