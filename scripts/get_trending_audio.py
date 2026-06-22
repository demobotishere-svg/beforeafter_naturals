import json
import random
import os
import time
from ytmusicapi import YTMusic
import yt_dlp

def main():
    ytmusic = YTMusic()
    try:
        charts = ytmusic.get_charts(country="US")
    except Exception as e:
        charts = ytmusic.get_charts()
        
    trending_playlists = charts.get("videos", {}).get("items", []) if isinstance(charts.get("videos"), dict) else charts.get("videos", [])
    
    if not trending_playlists:
        print(json.dumps({"success": False, "error": "Could not find trending charts"}))
        return
        
    playlist_id = trending_playlists[0].get("playlistId")
    if not playlist_id:
        print(json.dumps({"success": False, "error": "Could not find trending playlist ID"}))
        return

    try:
        playlist = ytmusic.get_playlist(playlist_id)
        tracks = playlist.get("tracks", [])
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Failed to get playlist: {str(e)}"}))
        return

    if not tracks:
        print(json.dumps({"success": False, "error": "No tracks found in playlist"}))
        return
        
    top_tracks = tracks[:20]
    random.shuffle(top_tracks)
    
    timestamp = int(time.time())
    output_filename = f"trending-{timestamp}.mp3"
    output_path = os.path.join(os.getcwd(), "public", "audio", output_filename)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path.replace('.mp3', '.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True
    }
    
    for track in top_tracks:
        video_id = track.get("videoId")
        if not video_id: continue
        
        title = track.get("title")
        artist_data = track.get("artists", [])
        if isinstance(artist_data, list) and len(artist_data) > 0:
            artist = artist_data[0].get("name", "Unknown Artist")
        else:
            artist = "Unknown Artist"
            
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=True)
                duration = info.get("duration", 0)
                
            print(json.dumps({
                "success": True,
                "title": title,
                "artist": artist,
                "duration": duration,
                "audioUrl": f"/audio/{output_filename}"
            }))
            return # Success! Exit script.
        except Exception as e:
            # If download fails (e.g. video unavailable, region blocked), try the next song
            continue
            
    print(json.dumps({"success": False, "error": "All top 20 trending videos were unavailable or blocked."}))

if __name__ == "__main__":
    main()
