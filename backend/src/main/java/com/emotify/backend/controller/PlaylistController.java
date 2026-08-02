package com.emotify.backend.controller;

import com.emotify.backend.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            return ResponseEntity.ok(playlistService.createPlaylist(body.get("name"), auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserPlaylists(Authentication auth) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(auth.getName()));
    }

    @GetMapping("/{id}/songs")
    public ResponseEntity<?> getSongs(@PathVariable Long id) {
        return ResponseEntity.ok(playlistService.getPlaylistSongs(id));
    }

    @PostMapping("/{id}/songs")
    public ResponseEntity<?> addSong(@PathVariable Long id,
                                     @RequestBody Map<String, Object> song) {
        try {
            return ResponseEntity.ok(playlistService.addSong(id, song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.ok(Map.of("message", "Playlist deleted"));
    }

    @DeleteMapping("/songs/{songId}")
    public ResponseEntity<?> removeSong(@PathVariable Long songId) {
        playlistService.removeSong(songId);
        return ResponseEntity.ok(Map.of("message", "Song removed"));
    }
}