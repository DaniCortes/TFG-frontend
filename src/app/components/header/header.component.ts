import { SearchDropdownComponent } from '@/components/search-dropdown/search-dropdown.component';
import { SearchResults } from '@/interfaces/search.interfaces';
import { AuthService } from '@/services/auth.service';
import { SearchService } from '@/services/search.service';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  logoIonic,
  logOutOutline,
  menuOutline,
} from 'ionicons/icons';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonSearchbar,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    SearchDropdownComponent,
  ],
})
export class HeaderComponent implements OnDestroy {
  @Input() title: string = '';
  @Input() showBackButton: boolean = false;
  @ViewChild('searchbar', { read: ElementRef }) searchbarElement!: ElementRef;

  searchQuery = '';
  searchResults: SearchResults | null = null;
  showDropdown = false;
  isSearching = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private searchService: SearchService
  ) {
    addIcons({ logoIonic, logOutOutline, menuOutline, arrowBackOutline });
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch() {
    this.searchSubject
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((query) => {
          if (query.trim().length > 2) {
            this.isSearching = true;
            return this.searchService.searchAll(query.trim()).pipe(
              catchError((error) => {
                console.error('Search error:', error);
                this.isSearching = false;
                return EMPTY;
              })
            );
          } else {
            this.isSearching = false;
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (results: SearchResults) => {
          this.searchResults = results;
          this.showDropdown = true;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Search subscription error:', error);
          this.searchResults = null;
          this.showDropdown = false;
          this.isSearching = false;
        },
        complete: () => {
          console.log('Search completed');
        },
      });
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    if (this.searchQuery.trim().length > 0) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.hideDropdown();
    }
  }

  onSearchEnter() {
    if (this.searchQuery.trim().length > 0) {
      this.navigateToSearchResults();
    }
  }

  onSearchFocus() {
    if (this.searchResults && this.searchQuery.trim().length > 2) {
      this.showDropdown = true;
    }
  }

  onSearchBlur() {
    // Delay hiding dropdown to allow clicks on results
    setTimeout(() => {
      this.hideDropdown();
    }, 200);
  }

  onSearchClear() {
    this.searchQuery = '';
    this.hideDropdown();
  }

  private hideDropdown() {
    this.showDropdown = false;
    this.searchResults = null;
    this.isSearching = false;
    this.setupSearch();
  }

  navigateToSearchResults() {
    if (this.searchQuery.trim().length > 0) {
      this.hideDropdown();
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery.trim() },
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  returnToHome() {
    this.router.navigate(['/home']);
  }
}
