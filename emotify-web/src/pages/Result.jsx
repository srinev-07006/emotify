import React, { useState } from 'react';

const EMOJI = { happy:'😊', sad:'😢', angry:'😠', neutral:'😐', fear:'😨', surprise:'😲', disgust:'🤢' };

function Result({ result, navigate }) {
  const breakdown = result && result.breakdown ? result.breakdown : null;
  const legacy = result && result.emotion ? result : null;
  const [activeEmotion, setActiveEmotion] = useState(0);

  // Handle both old single-emotion and new multi-emotion response
  if (breakdown) {
    const current = breakdown[activeEmotion];
    return (
      <div className="result-screen">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate('camera')}>‹</button>
          <div className="topbar-logo">emo<span>tify</span></div>
          <button className="icon-btn" onClick={() => navigate('history')}>☰</button>
        </div>

        {/* Emotion breakdown pills */}
        <div style={{ padding: '16px 24px 8px' }}>
          <div style={{ fontSize:12, color:'#535353', marginBottom:10, fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>
            Detected over 5 seconds
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {breakdown.map(function(item, i) {
              const active = i === activeEmotion;
              return (
                <button key={i} onClick={() => setActiveEmotion(i)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 500,
                    border: active ? '2px solid #1DB954' : '2px solid #282828',
                    background: active ? '#1DB954' : '#1a1a1a',
                    color: active ? '#000' : '#fff',
                    fontWeight: 600, fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  {EMOJI[item.emotion] || '🎵'} {item.emotion} {item.percentage}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected emotion detail */}
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
          <div className="playlist-count">{current.songs ? current.songs.length : 0} tracks</div>
        </div>

        <div className="song-list">
          {current.songs && current.songs.map(function(song, i) {
            return (
              <div className="song-row" key={i}
                onClick={() => song.spotifyUrl && window.open(song.spotifyUrl, '_blank')}
                style={{ cursor: song.spotifyUrl ? 'pointer' : 'default' }}>
                <div className="song-num">{i + 1}</div>
                <div className="song-art">
                  {song.albumArt
                    ? <img src={song.albumArt} alt={song.title}
                        style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:4 }} />
                    : '🎵'}
                </div>
                <div className="song-info">
                  <div className="song-title">{song.title}</div>
                  <div className="song-artist">{song.artist}</div>
                </div>
                {song.spotifyUrl &&
                  <div style={{ color:'#1DB954', fontSize:18, flexShrink:0 }}>▶</div>
                }
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback for old single emotion response
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
        {songs.map(function(song, i) {
          return (
            <div className="song-row" key={i}
              onClick={() => song.spotifyUrl && window.open(song.spotifyUrl, '_blank')}
              style={{ cursor: song.spotifyUrl ? 'pointer' : 'default' }}>
              <div className="song-num">{i + 1}</div>
              <div className="song-art">
                {song.albumArt
                  ? <img src={song.albumArt} alt={song.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:4 }} />
                  : '🎵'}
              </div>
              <div className="song-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
              {song.spotifyUrl &&
                <div style={{ color:'#1DB954', fontSize:18, flexShrink:0 }}>▶</div>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Result;