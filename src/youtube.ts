const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function fetchPlaylistVideos(playlistUrl: string) {
  const listMatch = playlistUrl.match(/[?&]list=([^&]+)/);
  const playlistId = listMatch ? listMatch[1] : null;

  if (!playlistId) {
    throw new Error('Invalid YouTube Playlist URL. Could not find list ID.');
  }

  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'MY_YOUTUBE_API_KEY') {
    throw new Error('YouTube API Key not configured. Please add VITE_YOUTUBE_API_KEY to your .env file.');
  }

  let videos: { youtubeId: string; title: string }[] = [];
  let nextPageToken = '';

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&pageToken=${nextPageToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const items = data.items.map((item: any) => ({
      youtubeId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
    }));

    videos = [...videos, ...items];
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  return videos;
}
