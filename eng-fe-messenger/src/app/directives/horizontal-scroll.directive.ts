import { Directive, ElementRef, NgZone, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[horizontalScroll]',
  standalone: true
})
export class HorizontalScrollDirective implements OnInit, OnDestroy {
  private wheelListener: (event: WheelEvent) => void;

  constructor(
    private el: ElementRef,
    private ngZone: NgZone
  ) {
    this.wheelListener = () => {};
  }

  ngOnInit() {
    // Run outside Angular's change detection
    this.ngZone.runOutsideAngular(() => {
      this.wheelListener = this.setupWheelListener();
      this.el.nativeElement.addEventListener('wheel', this.wheelListener, { passive: false });
    });
  }

  ngOnDestroy() {
    this.el.nativeElement.removeEventListener('wheel', this.wheelListener);
  }

  private setupWheelListener(): (event: WheelEvent) => void {
    return (event: WheelEvent) => {
      if (event.deltaY !== 0) {
        event.preventDefault();
        
        // Calculate scroll amount
        const scrollAmount = event.deltaY > 0 ? 60 : -60;
        
        // Smooth scroll
        this.el.nativeElement.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    };
  }
} 