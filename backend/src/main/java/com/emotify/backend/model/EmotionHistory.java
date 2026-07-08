package com.emotify.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "emotion_history")
@Data
public class EmotionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private Long userId;
    private String emotion;
    private Double confidence;
    private LocalDateTime detectedAt = LocalDateTime.now();
}