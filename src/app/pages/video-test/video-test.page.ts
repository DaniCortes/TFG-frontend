import { VideoPlayerComponent } from '@/components/video-player/video-player.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-video-test',
  standalone: true,

  templateUrl: './video-test.page.html',
  styleUrl: './video-test.page.scss',
  imports: [VideoPlayerComponent],
})
export class VideoTestPage {
  // Video player parameters
  streamId = '685da595569aedd6a9daefbe';
  title = 'Default Title';
  isLive = true;

  showPlayer = true;

  updatePlayer() {
    this.showPlayer = false;
    setTimeout(() => {
      this.showPlayer = true;
    }, 100);
  }
}
