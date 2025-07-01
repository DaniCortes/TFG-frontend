import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() {}

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp + 'Z'); // Ensure the timestamp is in UTC format

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      if (seconds === 0) {
        return 'just now';
      } else if (seconds === 1) {
        return '1 second ago';
      }
      return `${seconds} seconds ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      if (minutes === 1) {
        return '1 minute ago';
      }
      return `${minutes} minutes ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      if (hours === 1) {
        return '1 hour ago';
      }
      return `${hours} hours ago`;
    } else if (seconds < 2592000) {
      const days = Math.floor(seconds / 86400);
      if (days === 1) {
        return '1 day ago';
      }
      return `${days} days ago`;
    } else if (seconds < 31536000) {
      const months = Math.floor(seconds / 2592000);
      if (months === 1) {
        return '1 month ago';
      }
      return `${months} months ago`;
    } else {
      const years = Math.floor(seconds / 31536000);
      if (years === 1) {
        return '1 year ago';
      }
      return `${years} years ago`;
    }
  }

  getStreamStartedTime(startTime: string): string {
    return `started ${this.getTimeAgo(startTime)}`;
  }

  formatDuration(duration: string): string {
    const durationInSeconds = this.parseDuration(duration);

    if (durationInSeconds < 60) {
      return `${durationInSeconds} seconds`;
    } else if (durationInSeconds < 3600) {
      const minutes = Math.floor(durationInSeconds / 60);
      return `${minutes} minutes`;
    } else if (durationInSeconds < 86400) {
      const hours = Math.floor(durationInSeconds / 3600);
      return `${hours} hours`;
    } else {
      const days = Math.floor(durationInSeconds / 86400);
      return `${days} days`;
    }
  }

  parseDuration(duration: string): number {
    const parts = duration.split(':').map(Number);
    let totalSeconds = 0;

    if (parts.length === 3) {
      totalSeconds += parts[0] * 3600;
      totalSeconds += parts[1] * 60;
      totalSeconds += parts[2];
    } else if (parts.length === 2) {
      totalSeconds += parts[0] * 60;
      totalSeconds += parts[1];
    } else if (parts.length === 1) {
      totalSeconds += parts[0];
    }

    return totalSeconds;
  }

  getDuration(startTime: string, endTime?: string): string {
    const start = new Date(startTime + 'Z');
    const end = new Date(endTime + 'Z');

    const durationInSeconds = Math.floor(
      (end.getTime() - start.getTime()) / 1000
    );

    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
