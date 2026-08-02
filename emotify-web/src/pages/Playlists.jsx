import React, { useEffect, useState } from 'react';
import api from '../api';

function Playlists({ navigate }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => { loadPlaylists(); }, []);

  const loadPlaylists = async () => {
    try {
      const res = await api.get('/playlists');
      setPlaylists(res.data);
    } catch { }
    setLoading(false);
  };

  const createPlaylist = async () => {
    if (!newName.trim()) return;
    try {
      await api.post('/playlists', { name: newName });
      setNewName(''); setCreating(false);
      loadPlaylists();
    } catch { }
  };

  const openPlaylist = async (playlist) => {
    setSelected(playlist);
    try {
      const res = await api.get(`/playlists/${playlist.id}/songs`);
      setSongs(res.data);
    } catch { setSongs([]); }
  };

  const deletePlaylist = async (id) => {
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await api.delete(`/playlists/${id}`);
      if (selected && selected.id === id) setSelected(null);
      loadPlaylists();
    } catch { }
  };

  const removeSong = async (songId) => {
    try {
      await api.delete(`/playlists/songs/${songId}`);
      setSongs(songs.filter(s => s.id !== songId));
    } catch { }
  };

  if (selected) {
    return (
      <div className="result-screen">
        <div className="topbar">
          <button className="back-btn" onClick={() => setSelected(null)}>‹</button>
          <div className="topbar-logo">emo<span>tify</span></div>
          <div style={{ width: 36 }} />
        </div>
        <div className="playlist-header">
          <div className="playlist-title">{selected.name}</div>
          <div className="playlist-count">{songs.length} songs</div>
        </div>
        <div className="song-list">
          {songs.length === 0
            ? <div className="empty-state">
                <div className="empty-icon">🎵</div>
                <div className="empty-title">No songs yet</div>
                <div className="empty-sub">Add songs from the result screen</div>
              </div>
            : songs.map(function(song, i) {
                return (
                  <div className="song-row" key={song.id}
                    style={{ position: 'relative' }}>
                    <div className="song-num">{i + 1}</div>
                    <div className="song-art"
                      onClick={() => song.songUrl && window.open(song.songUrl, '_blank')}
                      style={{ cursor: song.songUrl ? 'pointer' : 'default' }}>
                      {song.albumArt
                        ? <img src={song.albumArt} alt={song.title}
                            style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:4 }} />
                        : '🎵'}
                    </div>
                    <div className="song-info"
                      onClick={() => song.songUrl && window.open(song.songUrl, '_blank')}
                      style={{ cursor: song.songUrl ? 'pointer' : 'default' }}>
                      <div className="song-title">{song.title}</div>
                      <div className="song-artist">{song.artist}</div>
                    </div>
                    <button onClick={() => removeSong(song.id)}
                      style={{ background:'none', border:'none', color:'#535353', fontSize:18, cursor:'pointer', padding:'0 4px' }}>
                      ✕
                    </button>
                  </div>
                );
              })
          }
        </div>
      </div>
    );
  }

  return (
    <div className="history-screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('camera')}>‹</button>
        <div className="topbar-logo">emo<span>tify</span></div>
        <button className="icon-btn" onClick={() => setCreating(true)}>＋</button>
      </div>

      <div className="playlist-header">
        <div className="playlist-title">Your Playlists</div>
        <div className="playlist-count">{playlists.length} playlists</div>
      </div>

      {creating && (
        <div style={{ padding:'0 24px 16px', display:'flex', gap:8 }}>
          <input className="input" placeholder="Playlist name"
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createPlaylist()}
            style={{ flex:1, marginBottom:0 }} autoFocus />
          <button className="btn-primary"
            style={{ width:'auto', padding:'0 16px', marginTop:0 }}
            onClick={createPlaylist}>Create</button>
          <button className="btn-secondary"
            style={{ width:'auto', padding:'0 16px' }}
            onClick={() => setCreating(false)}>Cancel</button>
        </div>
      )}

      <div className="history-list">
        {loading
          ? <div className="loading-overlay"><div className="spinner" /></div>
          : playlists.length === 0
            ? <div className="empty-state">
                <div className="empty-icon">🎵</div>
                <div className="empty-title">No playlists yet</div>
                <div className="empty-sub">Tap + to create your first playlist</div>
              </div>
            : playlists.map(function(p) {
                return (
                  <div className="history-card" key={p.id}
                    onClick={() => openPlaylist(p)}>
                    <div className="history-emoji-box">
                      {p.coverArt
                        ? <img src={p.coverArt} alt={p.name}
                            style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:8 }} />
                        : '🎵'}
                    </div>
                    <div className="history-info">
                      <div className="history-emotion">{p.name}</div>
                      <div className="history-conf">{p.songCount} songs</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deletePlaylist(p.id); }}
                      style={{ background:'none', border:'none', color:'#535353', fontSize:16, cursor:'pointer' }}>
                      🗑
                    </button>
                  </div>
                );
              })
        }
      </div>
    </div>
  );
}

export default Playlists;