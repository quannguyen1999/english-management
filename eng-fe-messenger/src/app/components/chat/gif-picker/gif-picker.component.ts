import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gif-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatIconModule],
  templateUrl: './gif-picker.component.html',
  styles: [`
    .gif-picker {
      width: 320px;
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class GifPickerComponent {
  @Output() gifSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  private readonly GIPHY_API_KEY = environment.giphyApiKey;
  private searchSubject = new Subject<string>();

  searchQuery = '';
  gifs: any[] = [];
  isLoading = false;
  error: string | null = null;
  isVisible = false;

  constructor(private http: HttpClient) {
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchGifs(query)),
      catchError(error => {
        this.error = 'Failed to load GIFs. Please try again.';
        this.isLoading = false;
        return of({ data: [] });
      })
    ).subscribe(response => {
      this.gifs = response.data;
      this.isLoading = false;
      this.error = null;
    });
  }

  toggleGifPicker() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.loadTrendingGifs();
    }
  }

  searchQueryChanged(query: string) {
    this.isLoading = true;
    this.error = null;
    this.searchSubject.next(query);
  }

  private searchGifs(query: string) {
    const url = query
      ? `https://api.giphy.com/v1/gifs/search?api_key=${this.GIPHY_API_KEY}&q=${query}&limit=20&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${this.GIPHY_API_KEY}&limit=20&rating=g`;
    
    return this.http.get<any>(url).pipe(
      catchError(error => {
        this.error = 'Failed to load GIFs. Please try again.';
        this.isLoading = false;
        return of({ data: [] });
      })
    );
  }

  private loadTrendingGifs() {
    this.isLoading = true;
    this.error = null;
    this.searchGifs('').subscribe(response => {
      this.gifs = response.data;
      this.isLoading = false;
    });
  }

  selectGif(gifUrl: string) {
    this.gifSelected.emit(gifUrl);
    this.close.emit();
    this.isVisible = false;
  }

  onClose() {
    this.isVisible = false;
    this.close.emit();
  }
} 