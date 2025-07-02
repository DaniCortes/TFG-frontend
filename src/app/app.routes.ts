import { authGuard } from '@/guards/auth.guard';
import { HomePage } from '@/pages/home/home.page';
import { LoginPage } from '@/pages/login/login.page';
import { ProfilePage } from '@/pages/profile/profile.page';
import { RegisterPage } from '@/pages/register/register.page';
import { SearchResultsPage } from '@/pages/search-results/search-results.page';
import { VideoPage } from '@/pages/video/video.page';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
    data: { showSidebar: false, title: 'Root' },
  },
  {
    path: 'login',
    component: LoginPage,
    data: { showSidebar: false, title: 'Login' },
  },
  {
    path: 'register',
    component: RegisterPage,
    data: { showSidebar: false, title: 'Register' },
  },
  {
    path: 'home',
    component: HomePage,
    canActivate: [authGuard],
    data: { showSidebar: true, title: 'Home' },
  },
  {
    path: 'profile',
    component: ProfilePage,
    canActivate: [authGuard],
    data: { showSidebar: true, title: 'Profile' },
  },
  {
    path: 'search',
    component: SearchResultsPage,
    data: { showSidebar: true, title: 'Search Results' },
  },
  {
    path: 'vod/:id',
    component: VideoPage,
    data: { showSidebar: true, title: 'VOD Player' },
  },
  {
    path: 'u/:username',
    component: VideoPage,
    data: { showSidebar: true, title: 'Stream Player' },
  },
];
