import { LivestreamResultComponent } from '@/components/livestream-result/livestream-result.component';
import { UserResultComponent } from '@/components/user-result/user-result.component';
import { VodResultComponent } from '@/components/vod-result/vod-result.component';
import { SearchResults } from '@/interfaces/search.interfaces';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-dropdown',
  templateUrl: './search-dropdown.component.html',
  styleUrl: './search-dropdown.component.scss',
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonItemDivider,
    IonLabel,
    IonButton,
    IonItem,
    IonSpinner,
    IonText,
    UserResultComponent,
    LivestreamResultComponent,
    VodResultComponent,
  ],
})
export class SearchDropdownComponent {
  @Input() results: SearchResults | null = null;
  @Input() isVisible = false;
  @Input() isLoading = false;
  @Output() viewAll = new EventEmitter<void>();

  viewAllResults() {
    this.viewAll.emit();
  }

  hasResults(): boolean {
    return !!(
      this.results &&
      (this.results.users.length > 0 ||
        this.results.livestreams.length > 0 ||
        this.results.vods.length > 0)
    );
  }
}
