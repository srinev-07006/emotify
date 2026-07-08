package com.emotify.backend.repository;

import com.emotify.backend.model.EmotionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmotionHistoryRepository extends JpaRepository<EmotionHistory, Long> {
    List<EmotionHistory> findByUserIdOrderByDetectedAtDesc(Long userId);
}