const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const METAL_KEYWORDS = ['metal music', 'heavy metal', 'metal band'];

export async function searchMetalVideos() {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${
      encodeURIComponent(METAL_KEYWORDS.join('|'))
    }&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  
  // Filter to ensure only metal content
  return data.items.filter(item =>
    item.snippet.title.toLowerCase().includes('metal') ||
    item.snippet.description.toLowerCase().includes('metal')
  );
}