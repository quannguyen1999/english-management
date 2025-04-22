import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import rough from 'roughjs';

@Directive({
  selector: '[messageRoughBox]',
  standalone: true
})
export class MessageRoughBoxDirective implements AfterViewInit, OnDestroy {
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
  
    // Create new SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    const rc = rough.svg(this.svg);
    
    // Get current dimensions
    const rect = this.el.nativeElement.getBoundingClientRect();
    
    // Add margin for the border (increased from 4 to 8)
    const margin = 8;
    const width = rect.width + (margin * 2);
    const height = rect.height + (margin * 2);
    
    // Set SVG size
    this.svg.setAttribute('width', `${width}px`);
    this.svg.setAttribute('height', `${height}px`);
    
    // Draw the border with adjusted position to account for margin
    const roughRect = rc.rectangle(
      margin,
      margin,
      rect.width,
      rect.height,
      {
        stroke: '#2d3748',
        strokeWidth: 3, // Increased from 2 to 3
        roughness: 2.5, // Increased from 1.5 to 2.5
        bowing: 2, // Increased from 1 to 2
        seed: Math.random() * 100,
        fill: 'transparent'
      }
    );
  
    this.svg.appendChild(roughRect);
    
    // Position SVG
    this.svg.style.position = 'absolute';
    this.svg.style.top = `-${margin}px`;
    this.svg.style.left = `-${margin}px`;
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '1';
    
    // Set element styles
    this.el.nativeElement.style.position = 'relative';
    this.el.nativeElement.style.display = 'block'; // Changed from inline-block to block
    
    this.el.nativeElement.appendChild(this.svg);
  }
} 