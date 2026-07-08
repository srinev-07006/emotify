package com.emotify.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private LocalDateTime createdAt = LocalDateTime.now();
}