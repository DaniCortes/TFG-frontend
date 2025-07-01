export interface FollowedUser {
  user_id: string;
  username: string;
  profile_picture: string;
  stream_status: 'live' | 'offline';
  current_stream?: string;
}

export interface FollowsResponse {
  follows: FollowedUser[];
}
