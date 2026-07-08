package com.emotify.backend.service;

import com.emotify.backend.model.EmotionHistory;
import com.emotify.backend.model.User;
import com.emotify.backend.repository.EmotionHistoryRepository;
import com.emotify.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmotionService {

    private final EmotionHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    public Map<String, Object> detectEmotion(String base64Image, String email) {
        // Call Python FastAPI service
        Map<String, String> request = Map.of("image", base64Image);
        Map response = restTemplate.postForObject(
                pythonServiceUrl + "/predict",
                request,
                Map.class
        );

        String emotion = (String) response.get("emotion");
        Double confidence = ((Number) response.get("confidence")).doubleValue();

        // Save to history
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmotionHistory history = new EmotionHistory();
        history.setUserId(user.getId());
        history.setEmotion(emotion);
        history.setConfidence(confidence);
        historyRepository.save(history);

        return Map.of(
                "emotion", emotion,
                "confidence", confidence
        );
    }
}