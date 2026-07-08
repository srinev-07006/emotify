package com.emotify.backend.controller;

import com.emotify.backend.service.RecommendService;
import com.emotify.backend.repository.EmotionHistoryRepository;
import com.emotify.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;
    private final EmotionHistoryRepository historyRepository;
    private final UserRepository userRepository;

    @GetMapping("/recommend/{emotion}")
    public ResponseEntity<?> recommend(@PathVariable String emotion) {
        return ResponseEntity.ok(recommendService.recommend(emotion));
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(Authentication auth) {
        String email = auth.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(historyRepository.findByUserIdOrderByDetectedAtDesc(user.getId()));
    }
}