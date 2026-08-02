package com.emotify.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "playlist_songs")
@Data
public class PlaylistSong {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private Long playlistId;
    private String title;
    private String artist;
    private String album;
    private String albumArt;
    private String songUrl;
    private String previewUrl;
    private String source;
    private LocalDateTime addedAt = LocalDateTime.now();
}