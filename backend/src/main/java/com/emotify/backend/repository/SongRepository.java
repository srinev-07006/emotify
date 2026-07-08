package com.emotify.backend.repository;

import com.emotify.backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SongRepository extends JpaRepository<Song, Long> {
    List<Song> findByEmotionTag(String emotionTag);
}