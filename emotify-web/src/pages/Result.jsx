import React from 'react';

const EMOJI = { happy:'😊', sad:'😢', angry:'😠', neutral:'😐', fear:'😨', surprise:'😲', disgust:'🤢' };

function Result({ result, navigate }) {
  const emotion = (result && result.emotion) ? result.emotion : 'unknown';
  const confidence = (result && result.confidence) ? result.confidence : 0;
  const songs = (result && result.songs) ? result.songs : [];
  const pct = (confidence * 100).toFixed(1);

  return (
    <div className="result-screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('camera')}>‹</button>
        <div className="topbar-logo">emo<span>tify</span></div>
        <button className="icon-btn" onClick={() => navigate('history')}>☰</button>
      </div>

      <div className="emotion-hero">
        <div className="emotion-avatar">{EMOJI[emotion] || '🎵'}</div>
        <div style={{flex:1}}>
          <div className="emotion-tag">Detected emotion</div>
          <div className="emotion-name">{emotion}</div>
          <div className="emotion-conf-text">{pct}% confidence</div>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{width: pct + '%'}} />
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
              <div className="empty-sub">Try scanning again</div>
            </div>
          : songs.map(function(song, i) {
              return (
                <div className="song-row" key={i}>
                  <div className="song-num">{i + 1}</div>
                  <div className="song-art">🎵</div>
                  <div className="song-info">
                    <div className="song-title">{song.title}</div>
                    <div className="song-artist">{song.artist}</div>
                  </div>
                  <div className="song-genre-tag">{song.genre}</div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

export default Result;