import React, { useEffect, useState } from 'react';
import api from '../api';

const EMOJI = { happy:'😊', sad:'😢', angry:'😠', neutral:'😐', fear:'😨', surprise:'😲', disgust:'🤢' };

function History({ navigate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/history')
      .then(function(res) { setHistory(res.data); })
      .catch(function() {})
      .finally(function() { setLoading(false); });
  }, []);

  return (
    <div className="history-screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('camera')}>‹</button>
        <div className="topbar-logo">emo<span>tify</span></div>
        <div style={{width:36}} />
      </div>

      <div className="playlist-header">
        <div className="playlist-title">Mood History</div>
        <div className="playlist-count">{history.length} scans</div>
      </div>

      <div className="history-list">
        {loading
          ? <div className="loading-overlay"><div className="spinner" /></div>
          : history.length === 0
            ? <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No history yet</div>
                <div className="empty-sub">Take your first scan to see it here</div>
              </div>
            : history.map(function(item, i) {
                return (
                  <div className="history-card" key={i}>
                    <div className="history-emoji-box">{EMOJI[item.emotion] || '🎵'}</div>
                    <div className="history-info">
                      <div className="history-emotion">{item.emotion}</div>
                      <div className="history-conf">{((item.confidence || 0) * 100).toFixed(1)}% confidence</div>
                    </div>
                    <div className="history-date">{item.detectedAt ? item.detectedAt.substring(0,10) : ''}</div>
                  </div>
                );
              })
        }
      </div>
    </div>
  );
}

export default History;