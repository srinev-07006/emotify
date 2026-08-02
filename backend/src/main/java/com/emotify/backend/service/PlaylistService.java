package com.emotify.backend.service;

import com.emotify.backend.model.Playlist;
import com.emotify.backend.model.PlaylistSong;
import com.emotify.backend.repository.PlaylistRepository;
import com.emotify.backend.repository.PlaylistSongRepository;
import com.emotify.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final UserRepository userRepository;

    public Playlist createPlaylist(String name, String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Playlist playlist = new Playlist();
        playlist.setUserId(user.getId());
        playlist.setName(name);
        return playlistRepository.save(playlist);
    }

    public List<Map<String, Object>> getUserPlaylists(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Playlist> playlists = playlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Playlist p : playlists) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("createdAt", p.getCreatedAt());
            List<PlaylistSong> songs = playlistSongRepository.findByPlaylistIdOrderByAddedAtAsc(p.getId());
            map.put("songCount", songs.size());
            map.put("coverArt", songs.isEmpty() ? null : songs.get(0).getAlbumArt());
            result.add(map);
        }
        return result;
    }

    public List<PlaylistSong> getPlaylistSongs(Long playlistId) {
        return playlistSongRepository.findByPlaylistIdOrderByAddedAtAsc(playlistId);
    }

    public PlaylistSong addSong(Long playlistId, Map<String, Object> songData) {
        PlaylistSong song = new PlaylistSong();
        song.setPlaylistId(playlistId);
        song.setTitle((String) songData.get("title"));
        song.setArtist((String) songData.get("artist"));
        song.setAlbum((String) songData.get("album"));
        song.setAlbumArt((String) songData.get("albumArt"));
        song.setSongUrl((String) songData.get("spotifyUrl"));
        song.setPreviewUrl((String) songData.get("previewUrl"));
        song.setSource((String) songData.get("source"));
        return playlistSongRepository.save(song);
    }

    public void deletePlaylist(Long playlistId) {
        playlistSongRepository.deleteByPlaylistId(playlistId);
        playlistRepository.deleteById(playlistId);
    }

    public void removeSong(Long songId) {
        playlistSongRepository.deleteById(songId);
    }
}