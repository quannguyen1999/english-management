import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-gif-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gif-picker bg-white rounded-lg shadow-lg p-2 border border-gray-200">
      <!-- Search -->
      <div class="px-2 mb-2">
        <input type="text" 
               [(ngModel)]="searchQuery"
               (ngModelChange)="searchQueryChanged($event)"
               placeholder="Search GIFs..."
               class="w-full p-2 border rounded-lg text-sm">
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center h-40">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>

      <!-- GIFs Grid -->
      <div class="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto p-1">
        <div *ngFor="let gif of gifs" 
             (click)="selectGif(gif.images.fixed_height.url)"
             class="cursor-pointer hover:opacity-80 relative group">
          <img [src]="gif.images.fixed_height.url" 
               [alt]="gif.title"
               class="w-full h-32 object-cover rounded-lg">
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg"></div>
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf="!isLoading && gifs.length === 0" class="text-center py-4 text-gray-500">
        No GIFs found
      </div>
    </div>
  `,
  styles: [`
    .gif-picker {
      width: 320px;
    }
  `]
})
export class GifPickerComponent {
  @Output() gifSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  private readonly GIPHY_API_KEY = '7Labx1mK8QroJrvK7v0qzwfednypcNP5';
  private searchSubject = new Subject<string>();

  searchQuery = '';
  gifs: any[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchGifs(query))
    ).subscribe(response => {
      this.gifs = response.data;
      this.isLoading = false;
    });

    // Load trending GIFs initially
    this.loadTrendingGifs();
  }

  searchQueryChanged(query: string) {
    this.isLoading = true;
    this.searchSubject.next(query);
  }

  private searchGifs(query: string) {
    const url = query
      ? `https://api.giphy.com/v1/gifs/search?api_key=${this.GIPHY_API_KEY}&q=${query}&limit=20&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${this.GIPHY_API_KEY}&limit=20&rating=g`;
    
    return this.http.get<any>(url);
  }

  private loadTrendingGifs() {
    this.isLoading = true;
    this.searchGifs('').subscribe(response => {
      this.gifs = response.data;
      this.isLoading = false;
    });
  }

  selectGif(gifUrl: string) {
    this.gifSelected.emit(gifUrl);
    this.close.emit();
  }
} 