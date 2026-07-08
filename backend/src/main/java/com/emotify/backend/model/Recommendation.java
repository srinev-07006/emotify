package com.emotify.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "recommendations")
@Data
public class Recommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String emotion;
    private Long songId;
    private Double score = 1.0;
}