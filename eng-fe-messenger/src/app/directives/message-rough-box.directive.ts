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
    
    // Set container styles first
    const containerStyle = this.el.nativeElement.style;
    containerStyle.position = 'relative';
    containerStyle.display = 'inline-block';
    containerStyle.padding = '8px';
    containerStyle.margin = '4px 0';
    
    // Get dimensions after styles are applied
    const rect = this.el.nativeElement.getBoundingClientRect();
    
    // Calculate SVG dimensions
    const strokeWidth = 2;
    const padding = 8;
    const width = rect.width;
    const height = rect.height;
    
    // Configure SVG
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '1';
    
    // Set SVG viewport
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Draw the rectangle
    const roughRect = rc.rectangle(
      0,
      0,
      width,
      height,
      {
        stroke: '#2d3748',
        strokeWidth,
        roughness: 1.5,
        bowing: 1,
        seed: Math.random() * 100,
        fill: 'transparent'
      }
    );
  
    this.svg.appendChild(roughRect);
    this.el.nativeElement.appendChild(this.svg);
  }
} 