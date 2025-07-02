import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import Hls from 'hls.js';
import { addIcons } from 'ionicons';
import {
  contractOutline,
  expandOutline,
  pauseOutline,
  playOutline,
  radioOutline,
  settingsOutline,
  volumeHighOutline,
  volumeMuteOutline,
} from 'ionicons/icons';
import { apiUrl } from 'src/environments/environment';

interface QualityLevel {
  height: number;
  index: number;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [IonButton, IonIcon, IonSpinner],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() streamId!: string;
  @Input() isLive = true;
  @Input() title = 'Video Player';
  thumbnailUrl: string = '';

  @ViewChild('videoElement', { static: true })
  videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer', { static: true })
  videoContainer!: ElementRef<HTMLDivElement>;

  // Player state
  isPlaying = false;
  isMuted = false;
  isFullscreen = false;
  isLoading = true;
  showControls = false;
  showQualityMenu = false;

  // Progress tracking (for VOD)
  currentTime = 0;
  duration = 0;
  progress = 0;

  // Quality levels
  qualityLevels: QualityLevel[] = [];
  currentQuality = -1; // -1 for auto

  private hls: Hls | null = null;
  private controlsTimeout: any;
  private clickTimer: any;
  private isDoubleClick = false;

  constructor() {
    addIcons({
      playOutline,
      pauseOutline,
      volumeHighOutline,
      volumeMuteOutline,
      expandOutline,
      contractOutline,
      settingsOutline,
      radioOutline,
    });
  }

  ngOnInit() {
    this.thumbnailUrl = `${apiUrl}/streams/${this.streamId}/thumbnail.webp`;
    this.setupEventListeners();
  }

  ngAfterViewInit() {
    if (this.streamId) {
      this.initializePlayer();
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private get videoUrl(): string {
    const type = this.isLive ? 'live' : 'vod';
    return `${apiUrl}/${type}/${this.streamId}/master.m3u8`;
  }

  private initializePlayer() {
    const video = this.videoElement.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: this.isLive,
        backBufferLength: this.isLive ? 0 : 30,
        maxBufferLength: this.isLive ? 4 : 30,
        maxMaxBufferLength: this.isLive ? 6 : 60,
      });

      this.hls.loadSource(this.videoUrl);
      this.hls.attachMedia(video);

      this.setupHlsEvents();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = this.videoUrl;
    } else {
      console.error('HLS is not supported in this browser');
    }
  }

  private setupHlsEvents() {
    if (!this.hls) return;

    this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      this.isLoading = false;

      // Setup quality levels
      this.qualityLevels = data.levels.map((level, index) => ({
        height: level.height || 0,
        index: index,
      }));

      // Auto-detect if live based on manifest
      if (data.levels[0]?.details) {
        this.isLive = data.levels[0].details.live;
      }
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      this.currentQuality = data.level;
    });

    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      const video = this.videoElement.nativeElement;
      video.autoplay = true;
    });

    this.hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data);

      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('Network error, trying to recover...');
            this.hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Media error, trying to recover...');
            this.hls?.recoverMediaError();
            break;
          default:
            console.error('Fatal error, cannot recover');
            this.cleanup();
            break;
        }
      }
    });
  }

  private setupEventListeners() {
    // Fullscreen change listener
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
  }

  // Video event handlers
  onVideoClick() {
    if (this.clickTimer === null) {
      this.clickTimer = setTimeout(() => {
        if (!this.isDoubleClick) {
          this.togglePlayPause();
        }
        this.clickTimer = null;
        this.isDoubleClick = false;
      }, 200);
    }
  }

  onVideoDoubleClick() {
    this.isDoubleClick = true;
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    this.toggleFullscreen();
  }

  onVideoLoadStart() {
    this.isLoading = true;
  }

  onVideoCanPlay() {
    this.isLoading = false;
  }

  onVideoTimeUpdate() {
    const video = this.videoElement.nativeElement;
    this.currentTime = video.currentTime;
    this.duration = video.duration || 0;

    if (!this.isLive && this.duration > 0) {
      this.progress = (this.currentTime / this.duration) * 100;
    }
  }

  onVideoPlay() {
    this.isPlaying = true;
  }

  onVideoPause() {
    this.isPlaying = false;
  }

  onMouseEnter() {
    this.showControls = true;
    this.clearControlsTimeout();
  }

  onMouseLeave() {
    this.setControlsTimeout();
  }

  onMouseMove() {
    this.showControls = true;
    this.clearControlsTimeout();
    this.setControlsTimeout();
  }

  private setControlsTimeout() {
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.showControls = false;
      }
    }, 3000);
  }

  private clearControlsTimeout() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }
  }

  // Control methods
  togglePlayPause() {
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      if (this.isLive) {
        this.seekToLive();
      } else {
        video.play();
      }
    } else {
      video.pause();
    }
  }

  toggleMute() {
    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await this.videoContainer.nativeElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }

  toggleQualityMenu() {
    this.showQualityMenu = !this.showQualityMenu;
  }

  selectQuality(qualityIndex: number) {
    if (this.hls) {
      this.hls.currentLevel = qualityIndex;
      this.currentQuality = qualityIndex;
      this.showQualityMenu = false;
    }
  }

  onProgressClick(event: MouseEvent) {
    if (this.isLive) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const video = this.videoElement.nativeElement;

    video.currentTime = pos * video.duration;
  }

  seekToLive() {
    if (
      this.hls &&
      this.hls.liveSyncPosition !== undefined &&
      this.hls.liveSyncPosition !== null
    ) {
      const video = this.videoElement.nativeElement;
      video.currentTime = this.hls.liveSyncPosition;
      video.play();
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private cleanup() {
    this.clearControlsTimeout();

    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }
}
