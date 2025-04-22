import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import rough from 'roughjs';

@Directive({
  selector: '[roughBox]',
  standalone: true
})
export class RoughBoxDirective implements AfterViewInit, OnDestroy {
  private resizeObserver: ResizeObserver;
  private svg: SVGSVGElement | null = null;

  constructor(private el: ElementRef) {
    // Create a resize observer to handle element size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.updateRoughElement();
    });
  }

  ngAfterViewInit() {
    // Start observing the element
    this.resizeObserver.observe(this.el.nativeElement);
    this.updateRoughElement();
  }

  ngOnDestroy() {
    // Clean up
    this.resizeObserver.disconnect();
    this.svg?.remove();
  }

  private updateRoughElement() {
    // Remove existing SVG if any
    this.svg?.remove();

    // Create new SVG with correct type
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    const rc = rough.svg(this.svg);
    
    // Get current dimensions
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.svg.setAttribute('width', `${rect.width}px`);
    this.svg.setAttribute('height', `${rect.height}px`);
    
    // Draw sketchy border rectangle
    const roughRect = rc.rectangle(2, 2, rect.width - 4, rect.height - 4, {
      stroke: '#2d3748',
      strokeWidth: 3,
      roughness: 2.5,
      bowing: 2,
      fill: 'transparent'
    });

    this.svg.appendChild(roughRect);
    
    // Position SVG
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '1';
    
    // Ensure parent element has position relative
    if (getComputedStyle(this.el.nativeElement).position === 'static') {
      this.el.nativeElement.style.position = 'relative';
    }
    
    this.el.nativeElement.appendChild(this.svg);
  }
} 