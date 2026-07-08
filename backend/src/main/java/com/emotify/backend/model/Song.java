package com.emotify.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "songs")
@Data
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String title;
    private String artist;
    private String genre;
    private String emotionTag;
    private String duration;
    private String thumbnailUrl;
}