package com.emotify.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final MusicService deezerService;

    public List<Map<String, Object>> recommend(String emotion) {
        return deezerService.searchTracks(emotion, 20);
    }
}