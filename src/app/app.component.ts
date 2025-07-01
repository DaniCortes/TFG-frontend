import { HeaderComponent } from '@/components/header/header.component';
import { SidebarComponent } from '@/components/sidebar/sidebar.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  IonApp,
  IonMenu,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonSplitPane,
    SidebarComponent,
    HeaderComponent,
  ],
})
export class AppComponent implements OnInit {
  showSidebar = true;
  pageTitle = '';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }

        const showSidebar = route.snapshot.data['showSidebar'];
        const title = route.snapshot.data['title'];
        this.showSidebar = showSidebar !== false;
        this.pageTitle = title || '';
      });
  }
}
