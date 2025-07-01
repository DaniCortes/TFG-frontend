import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoTestPage } from './video-test.page';

describe('VideoTestPage', () => {
  let component: VideoTestPage;
  let fixture: ComponentFixture<VideoTestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
