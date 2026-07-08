package com.emotify.backend.controller;

import com.emotify.backend.service.EmotionService;
import com.emotify.backend.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
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
            String email = auth.getName();
            Map<String, Object> result = emotionService.detectEmotion(body.get("image"), email);
            String emotion = (String) result.get("emotion");

            // Also return song recommendations immediately
            result.put("songs", recommendService.recommend(emotion));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}