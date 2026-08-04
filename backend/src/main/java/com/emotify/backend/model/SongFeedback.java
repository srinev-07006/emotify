package com.emotify.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "song_feedback")
@Data
public class SongFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private Long userId;
    private String songTitle;
    private String songArtist;
    private String emotion;
    private Boolean liked;
    private LocalDateTime createdAt = LocalDateTime.now();
}