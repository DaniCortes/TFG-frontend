export interface User {
  user_id: string;
  username: string;
  profile_picture: string;
  stream_status: 'offline' | 'live';
  followers_count: number;
}

export interface Stream {
  id: string;
  user_id: string;
  title: string;
  status: 'live' | 'transcoded';
  start_time: string;
  end_time: string;
}

export interface Livestream extends Stream {}

export interface VOD extends Stream {}

export interface SearchResults {
  users: User[];
  livestreams: Livestream[];
  vods: VOD[];
}

export interface PaginationRange {
  start: number;
  end: number;
}
