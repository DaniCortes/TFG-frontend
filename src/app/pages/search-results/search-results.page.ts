import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { LivestreamResultComponent } from '@/components/livestream-result/livestream-result.component';
import { UserResultComponent } from '@/components/user-result/user-result.component';
import { VodResultComponent } from '@/components/vod-result/vod-result.component';
import { Livestream, User, VOD } from '@/interfaces/search.interfaces';
import { SearchService } from '@/services/search.service';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    UserResultComponent,
    LivestreamResultComponent,
    VodResultComponent,
  ],
  templateUrl: './search-results.page.html',
  styleUrl: './search-results.page.scss',
})
export class SearchResultsPage implements OnInit {
  searchQuery = '';
  isLoading = false;

  allUsers: User[] = [];
  allLivestreams: Livestream[] = [];
  allVods: VOD[] = [];

  canLoadMoreUsers = true;
  canLoadMoreLivestreams = true;
  canLoadMoreVods = true;

  private usersPage = 0;
  private livestreamsPage = 0;
  private vodsPage = 0;
  private pageSize = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.performSearch();
      }
    });
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    if (this.searchQuery.trim()) {
      this.resetPagination();
      this.performSearch();

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.searchQuery },
        queryParamsHandling: 'merge',
      });
    }
  }

  private resetPagination() {
    this.allUsers = [];
    this.allLivestreams = [];
    this.allVods = [];
    this.usersPage = 0;
    this.livestreamsPage = 0;
    this.vodsPage = 0;
    this.canLoadMoreUsers = true;
    this.canLoadMoreLivestreams = true;
    this.canLoadMoreVods = true;
  }

  private performSearch() {
    if (!this.searchQuery.trim()) return;

    this.isLoading = true;

    const ranges = {
      users: { start: 0, end: this.pageSize - 1 },
      livestreams: { start: 0, end: this.pageSize - 1 },
      vods: { start: 0, end: this.pageSize - 1 },
    };

    this.searchService.searchAll(this.searchQuery, ranges).subscribe({
      next: (results) => {
        this.allUsers = results.users;
        this.allLivestreams = results.livestreams;
        this.allVods = results.vods;

        this.canLoadMoreUsers = results.users.length === this.pageSize;
        this.canLoadMoreLivestreams =
          results.livestreams.length === this.pageSize;
        this.canLoadMoreVods = results.vods.length === this.pageSize;

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isLoading = false;
      },
    });
  }

  loadMoreUsers() {
    this.usersPage++;
    const start = this.usersPage * this.pageSize;
    const end = start + this.pageSize - 1;

    this.searchService.searchUsers(this.searchQuery, { start, end }).subscribe({
      next: (users) => {
        this.allUsers = [...this.allUsers, ...users];
        this.canLoadMoreUsers = users.length === this.pageSize;
      },
    });
  }

  loadMoreLivestreams() {
    this.livestreamsPage++;
    const start = this.livestreamsPage * this.pageSize;
    const end = start + this.pageSize - 1;

    this.searchService
      .searchLivestreams(this.searchQuery, { start, end })
      .subscribe({
        next: (livestreams) => {
          this.allLivestreams = [...this.allLivestreams, ...livestreams];
          this.canLoadMoreLivestreams = livestreams.length === this.pageSize;
        },
      });
  }

  loadMoreVods() {
    this.vodsPage++;
    const start = this.vodsPage * this.pageSize;
    const end = start + this.pageSize - 1;

    this.searchService.searchVODs(this.searchQuery, { start, end }).subscribe({
      next: (vods) => {
        this.allVods = [...this.allVods, ...vods];
        this.canLoadMoreVods = vods.length === this.pageSize;
      },
    });
  }

  hasAnyResults(): boolean {
    return (
      this.allUsers.length > 0 ||
      this.allLivestreams.length > 0 ||
      this.allVods.length > 0
    );
  }
}
