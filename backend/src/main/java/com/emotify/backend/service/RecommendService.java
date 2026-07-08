package com.emotify.backend.service;

import com.emotify.backend.model.Song;
import com.emotify.backend.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final SongRepository songRepository;

    public List<Song> recommend(String emotion) {
        List<Song> songs = songRepository.findByEmotionTag(emotion);
        if (songs.isEmpty()) {
            // Fallback to neutral if no songs found for emotion
            songs = songRepository.findByEmotionTag("neutral");
        }
        return songs;
    }
}