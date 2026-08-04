package com.emotify.backend.controller;

import com.emotify.backend.model.SongFeedback;
import com.emotify.backend.repository.EmotionHistoryRepository;
import com.emotify.backend.repository.SongFeedbackRepository;
import com.emotify.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final EmotionHistoryRepository historyRepository;
    private final SongFeedbackRepository feedbackRepository;

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        var history = historyRepository.findByUserIdOrderByDetectedAtDesc(user.getId());

        // Emotion frequency map
        Map<String, Long> emotionCounts = history.stream()
                .collect(Collectors.groupingBy(h -> h.getEmotion(), Collectors.counting()));

        // Most common emotion
        String dominantEmotion = emotionCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("none");

        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("totalScans", history.size());
        profile.put("dominantEmotion", dominantEmotion);
        profile.put("emotionCounts", emotionCounts);
        profile.put("joinedAt", user.getCreatedAt());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        var history = historyRepository.findByUserIdOrderByDetectedAtDesc(user.getId());

        Map<String, Long> emotionCounts = history.stream()
                .collect(Collectors.groupingBy(h -> h.getEmotion(), Collectors.counting()));

        long total = history.size();
        List<Map<String, Object>> breakdown = new ArrayList<>();
        for (Map.Entry<String, Long> entry : emotionCounts.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("emotion", entry.getKey());
            item.put("count", entry.getValue());
            item.put("percentage", total > 0 ? (int) Math.round((entry.getValue() * 100.0) / total) : 0);
            breakdown.add(item);
        }
        breakdown.sort((a, b) -> ((Integer) b.get("percentage")) - ((Integer) a.get("percentage")));

        return ResponseEntity.ok(Map.of(
                "breakdown", breakdown,
                "totalScans", total,
                "recentHistory", history.subList(0, Math.min(7, history.size()))
        ));
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> body,
                                            Authentication auth) {
        try {
            var user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            SongFeedback feedback = new SongFeedback();
            feedback.setUserId(user.getId());
            feedback.setSongTitle((String) body.get("songTitle"));
            feedback.setSongArtist((String) body.get("songArtist"));
            feedback.setEmotion((String) body.get("emotion"));
            feedback.setLiked((Boolean) body.get("liked"));
            feedbackRepository.save(feedback);
            return ResponseEntity.ok(Map.of("message", "Feedback saved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/feedback")
    public ResponseEntity<?> getFeedback(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(feedbackRepository.findByUserId(user.getId()));
    }
}