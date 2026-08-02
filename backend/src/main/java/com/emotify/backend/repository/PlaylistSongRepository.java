package com.emotify.backend.repository;

import com.emotify.backend.model.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    List<PlaylistSong> findByPlaylistIdOrderByAddedAtAsc(Long playlistId);
    void deleteByPlaylistId(Long playlistId);
}