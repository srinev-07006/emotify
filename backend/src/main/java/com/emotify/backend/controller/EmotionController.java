package com.emotify.backend.controller;

import com.emotify.backend.service.EmotionService;
import com.emotify.backend.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
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
}