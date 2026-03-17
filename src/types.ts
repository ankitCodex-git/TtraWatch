export interface Playlist {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface Video {
  id: string;
  playlistId: string;
  youtubeId: string;
  title: string;
  completed: boolean;
  createdAt: number;
  lastWatchedAt?: number;
}
