package com.emotify.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MusicService {

    private final RestTemplate restTemplate;

    private static final Map<String, String> EMOTION_QUERIES = Map.of(
            "happy",    "feel+good+upbeat+pop",
            "sad",      "emotional+heartbreak+ballad",
            "angry",    "heavy+metal+rock+intense",
            "neutral",  "lofi+chill+instrumental",
            "fear",     "dark+cinematic+thriller",
            "surprise", "energetic+upbeat+dance",
            "disgust",  "alternative+indie+grunge"
    );

    public List<Map<String, Object>> searchTracks(String emotion, int limit) {
        try {
            String query = EMOTION_QUERIES.getOrDefault(emotion, "pop");
            String url = "https://itunes.apple.com/search?term=" + query
                    + "&media=music&limit=" + limit
                    + "&entity=song";
            System.out.println("Calling iTunes: " + url);  // add this
            Map response = restTemplate.getForObject(url, Map.class);
            List<Map> items = (List<Map>) response.get("results");

            List<Map<String, Object>> result = new ArrayList<>();
            for (Map item : items) {
                Map<String, Object> track = new HashMap<>();
                track.put("title", item.get("trackName"));
                track.put("artist", item.get("artistName"));
                track.put("album", item.get("collectionName"));
                track.put("albumArt", item.get("artworkUrl100"));
                track.put("spotifyUrl", item.get("trackViewUrl"));
                track.put("previewUrl", item.get("previewUrl"));
                track.put("source", "itunes");
                result.add(track);
            }
            return result;
        } catch (Exception e) {
            System.out.println("iTunes error: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}