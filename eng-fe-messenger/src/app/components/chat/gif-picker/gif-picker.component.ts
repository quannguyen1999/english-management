import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gif-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gif-picker.component.html',
  styles: [`
    .gif-picker {
      width: 320px;
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