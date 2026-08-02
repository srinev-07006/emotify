import React, { useState } from 'react';
import api from '../api';

const EMOJI = { happy:'😊', sad:'😢', angry:'😠', neutral:'😐', fear:'😨', surprise:'😲', disgust:'🤢' };

function Result({ result, navigate }) {
  const breakdown = result && result.breakdown ? result.breakdown : null;
  const legacy = result && result.emotion ? result : null;
  const [activeEmotion, setActiveEmotion] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(null);

  const loadPlaylists = async () => {
    try {
      const res = await api.get('/playlists');
      setPlaylists(res.data);
    } catch { }
  };

  const addToPlaylist = async (playlistId, song) => {
    try {
      await api.post(`/playlists/${playlistId}/songs`, song);
      setShowPlaylistPicker(null);
      alert('Added to playlist!');
    } catch { alert('Failed to add song'); }
  };

  const SongRow = ({ song, index }) => (
    <div className="song-row" key={index}>
      <div className="song-num">{index + 1}</div>
      <div className="song-art"
        onClick={() => song.spotifyUrl && window.open(song.spotifyUrl, '_blank')}
        style={{ cursor: song.spotifyUrl ? 'pointer' : 'default' }}>
        {song.albumArt
          ? <img src={song.albumArt} alt={song.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:4 }} />
          : '🎵'}
      </div>
      <div className="song-info"
        onClick={() => song.spotifyUrl && window.open(song.spotifyUrl, '_blank')}
        style={{ cursor: song.spotifyUrl ? 'pointer' : 'default' }}>
        <div className="song-title">{song.title}</div>
        <div className="song-artist">{song.artist}</div>
      </div>
      <button onClick={e => {
        e.stopPropagation();
        loadPlaylists();
        setShowPlaylistPicker(song);
      }} style={{
        background:'none', border:'1px solid #282828',
        borderRadius:500, color:'#B3B3B3',
        fontSize:11, padding:'4px 8px', cursor:'pointer', flexShrink:0,
      }}>+ Add</button>
      {song.spotifyUrl &&
        <div style={{ color:'#1DB954', fontSize:18, flexShrink:0, cursor:'pointer' }}
          onClick={() => window.open(song.spotifyUrl, '_blank')}>▶</div>
      }
    </div>
  );

  const PlaylistPicker = () => (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.8)',
      display:'flex', alignItems:'flex-end', zIndex:100,
    }} onClick={() => setShowPlaylistPicker(null)}>
      <div style={{
        background:'#1a1a1a', borderRadius:'16px 16px 0 0',
        padding:24, width:'100%', maxWidth:480, margin:'0 auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Add to Playlist</div>
        <div style={{ fontSize:13, color:'#535353', marginBottom:16 }}>
          {showPlaylistPicker && showPlaylistPicker.title}
        </div>
        {playlists.length === 0
          ? <div style={{ color:'#535353', fontSize:14, marginBottom:16 }}>
              No playlists yet. Create one from the playlists screen.
            </div>
          : playlists.map(function(p) {
              return (
                <div key={p.id}
                  onClick={() => addToPlaylist(p.id, showPlaylistPicker)}
                  style={{
                    padding:'12px 0', borderBottom:'1px solid #282828',
                    cursor:'pointer', display:'flex', alignItems:'center', gap:12,
                  }}>
                  <div style={{
                    width:40, height:40, borderRadius:6,
                    background:'#282828', display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:20,
                    overflow:'hidden', flexShrink:0,
                  }}>
                    {p.coverArt
                      ? <img src={p.coverArt} alt={p.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : '🎵'}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:'#535353' }}>{p.songCount} songs</div>
                  </div>
                </div>
              );
            })
        }
        <button className="btn-secondary" style={{ marginTop:16 }}
          onClick={() => setShowPlaylistPicker(null)}>Cancel</button>
      </div>
    </div>
  );

  if (breakdown) {
    const current = breakdown[activeEmotion];
    const songs = current.songs || [];

    return (
      <div className="result-screen">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate('camera')}>‹</button>
          <div className="topbar-logo">emo<span>tify</span></div>
          <button className="icon-btn" onClick={() => navigate('history')}>☰</button>
        </div>

        <div style={{ padding:'16px 24px 8px' }}>
          <div style={{
            fontSize:11, color:'#535353', marginBottom:10,
            fontWeight:600, letterSpacing:'1px', textTransform:'uppercase',
          }}>
            Detected over 5 seconds
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {breakdown.map(function(item, i) {
              const active = i === activeEmotion;
              return (
                <button key={i} onClick={() => setActiveEmotion(i)} style={{
                  padding:'8px 14px', borderRadius:500,
                  border: active ? '2px solid #1DB954' : '2px solid #282828',
                  background: active ? '#1DB954' : '#1a1a1a',
                  color: active ? '#000' : '#fff',
                  fontWeight:600, fontSize:13, cursor:'pointer',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  {EMOJI[item.emotion] || '🎵'} {item.emotion} {item.percentage}%
                </button>
              );
            })}
          </div>
        </div>

        <div className="emotion-hero">
          <div className="emotion-avatar">{EMOJI[current.emotion] || '🎵'}</div>
          <div style={{ flex:1 }}>
            <div className="emotion-tag">Selected emotion</div>
            <div className="emotion-name">{current.emotion}</div>
            <div className="emotion-conf-text">{current.percentage}% of the time</div>
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: current.percentage + '%' }} />
            </div>
          </div>
        </div>

        <div className="playlist-header">
          <div className="playlist-title">Songs for {current.emotion}</div>
          <div className="playlist-count">{songs.length} tracks</div>
        </div>

        <div className="song-list">
          {songs.length === 0
            ? <div className="empty-state">
                <div className="empty-icon">🎵</div>
                <div className="empty-title">No songs found</div>
              </div>
            : songs.map(function(song, i) {
                return <SongRow key={i} song={song} index={i} />;
              })
          }
        </div>

        {showPlaylistPicker && <PlaylistPicker />}
      </div>
    );
  }

  // Legacy single emotion fallback
  const emotion = legacy ? legacy.emotion : 'unknown';
  const confidence = legacy ? (legacy.confidence * 100).toFixed(1) : 0;
  const songs = legacy ? (legacy.songs || []) : [];

  return (
    <div className="result-screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('camera')}>‹</button>
        <div className="topbar-logo">emo<span>tify</span></div>
        <button className="icon-btn" onClick={() => navigate('history')}>☰</button>
      </div>

      <div className="emotion-hero">
        <div className="emotion-avatar">{EMOJI[emotion] || '🎵'}</div>
        <div style={{ flex:1 }}>
          <div className="emotion-tag">Detected emotion</div>
          <div className="emotion-name">{emotion}</div>
          <div className="emotion-conf-text">{confidence}% confidence</div>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{ width: confidence + '%' }} />
          </div>
        </div>
      </div>

      <div className="playlist-header">
        <div className="playlist-title">Songs for you</div>
        <div className="playlist-count">{songs.length} tracks</div>
      </div>

      <div className="song-list">
        {songs.length === 0
          ? <div className="empty-state">
              <div className="empty-icon">🎵</div>
              <div className="empty-title">No songs found</div>
            </div>
          : songs.map(function(song, i) {
              return <SongRow key={i} song={song} index={i} />;
            })
        }
      </div>

      {showPlaylistPicker && <PlaylistPicker />}
    </div>
  );
}

export default Result;