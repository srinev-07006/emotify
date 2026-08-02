package com.emotify.backend.controller;

import com.emotify.backend.service.EmotionService;
import com.emotify.backend.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/emotion")
@RequiredArgsConstructor
public class EmotionController {

    private final EmotionService emotionService;
    private final RecommendService recommendService;

    @PostMapping("/detect")
    public ResponseEntity<?> detect(@RequestBody Map<String, String> body,
                                    Authentication auth) {
        try {
            String image = body.get("image");
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "image field is required"));
            }

            String email = auth.getName();
            Map<String, Object> result = new HashMap<>(emotionService.detectEmotion(image, email));
            String emotion = (String) result.get("emotion");
            result.put("songs", recommendService.recommend(emotion));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/detect-multi")
    public ResponseEntity<?> detectMulti(@RequestBody Map<String, Object> body,
                                         Authentication auth) {
        try {
            String email = auth.getName();
            List<String> images = (List<String>) body.get("images");

            // Detect emotion for each frame
            List<String> emotions = new ArrayList<>();
            for (String image : images) {
                try {
                    Map<String, Object> result = emotionService.detectEmotion(image, email);
                    emotions.add((String) result.get("emotion"));
                } catch (Exception e) {
                    // skip failed frames
                }
            }

            if (emotions.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No emotions detected"));
            }

            // Count emotion frequencies
            Map<String, Long> counts = emotions.stream()
                    .collect(java.util.stream.Collectors.groupingBy(e -> e, java.util.stream.Collectors.counting()));

            // Build emotion breakdown with percentage
            List<Map<String, Object>> breakdown = new ArrayList<>();
            for (Map.Entry<String, Long> entry : counts.entrySet()) {
                Map<String, Object> item = new HashMap<>();
                item.put("emotion", entry.getKey());
                item.put("count", entry.getValue());
                item.put("percentage", (int) Math.round((entry.getValue() * 100.0) / emotions.size()));
                item.put("songs", recommendService.recommend(entry.getKey()));
                breakdown.add(item);
            }

            // Sort by percentage descending
            breakdown.sort((a, b) -> {
                int pctA = ((Number) a.get("percentage")).intValue();
                int pctB = ((Number) b.get("percentage")).intValue();
                return pctB - pctA;
            });

            return ResponseEntity.ok(Map.of(
                    "breakdown", breakdown,
                    "dominant", breakdown.get(0).get("emotion"),
                    "totalFrames", emotions.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}