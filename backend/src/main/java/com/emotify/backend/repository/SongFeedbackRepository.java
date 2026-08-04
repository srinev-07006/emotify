package com.emotify.backend.repository;

import com.emotify.backend.model.SongFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SongFeedbackRepository extends JpaRepository<SongFeedback, Long> {
    List<SongFeedback> findByUserId(Long userId);
}