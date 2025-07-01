import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-test',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Test Page</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>Test Page Works!</h1>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule]
})
export class TestPage {}