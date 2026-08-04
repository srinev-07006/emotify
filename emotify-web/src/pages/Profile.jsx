import React, { useEffect, useState } from 'react';
import api from '../api';

const EMOJI = { happy:'😊', sad:'😢', angry:'😠', neutral:'😐', fear:'😨', surprise:'😲', disgust:'🤢' };
const COLORS = {
  happy:'#1DB954', sad:'#4A90D9', angry:'#E74C3C',
  neutral:'#95A5A6', fear:'#9B59B6', surprise:'#F39C12', disgust:'#27AE60'
};

function Profile({ navigate, logout }) {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [p, a, f] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/analytics'),
        api.get('/profile/feedback'),
      ]);
      setProfile(p.data);
      setAnalytics(a.data);
      setFeedback(f.data);
    } catch { }
    setLoading(false);
  };

  if (loading) return (
    <div className="history-screen">
      <div className="loading-overlay"><div className="spinner" /></div>
    </div>
  );

  return (
    <div className="history-screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('camera')}>‹</button>
        <div className="topbar-logo">emo<span>tify</span></div>
        <button className="icon-btn" onClick={logout}>↪</button>
      </div>

      {/* Profile header */}
      <div style={{
        padding:'24px 24px 0',
        background:'linear-gradient(180deg, #1a1a1a 0%, #000 100%)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <div style={{
            width:64, height:64, borderRadius:'50%',
            background:'#1DB954', display:'flex',
            alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:700, color:'#000', flexShrink:0,
          }}>
            {profile && profile.name ? profile.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700 }}>{profile && profile.name}</div>
            <div style={{ fontSize:13, color:'#535353' }}>{profile && profile.email}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {[
            { label:'Total Scans', value: profile && profile.totalScans },
            { label:'Top Mood', value: profile && (EMOJI[profile.dominantEmotion] + ' ' + (profile.dominantEmotion || 'none')) },
            { label:'Songs Liked', value: feedback.filter(f => f.liked).length },
          ].map(function(stat, i) {
            return (
              <div key={i} style={{
                flex:1, background:'#1a1a1a', borderRadius:12,
                padding:'12px 8px', textAlign:'center',
              }}>
                <div style={{ fontSize:18, fontWeight:700, color:'#1DB954' }}>{stat.value}</div>
                <div style={{ fontSize:11, color:'#535353', marginTop:2 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid #282828' }}>
          {['profile', 'analytics', 'feedback'].map(function(t) {
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:'12px 0',
                background:'none', border:'none',
                borderBottom: tab === t ? '2px solid #1DB954' : '2px solid transparent',
                color: tab === t ? '#fff' : '#535353',
                fontWeight:600, fontSize:13, cursor:'pointer',
                textTransform:'capitalize',
              }}>{t}</button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div>
            <div style={{ fontSize:13, color:'#535353', marginBottom:16, fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>
              Account Info
            </div>
            {[
              { label:'Name', value: profile && profile.name },
              { label:'Email', value: profile && profile.email },
              { label:'Member since', value: profile && profile.joinedAt ? profile.joinedAt.substring(0,10) : '-' },
              { label:'Total scans', value: profile && profile.totalScans },
              { label:'Dominant emotion', value: profile && (EMOJI[profile.dominantEmotion] + ' ' + profile.dominantEmotion) },
            ].map(function(item, i) {
              return (
                <div key={i} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'14px 0', borderBottom:'1px solid #1a1a1a',
                }}>
                  <div style={{ fontSize:14, color:'#535353' }}>{item.label}</div>
                  <div style={{ fontSize:14, fontWeight:500 }}>{item.value}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Analytics tab */}
        {tab === 'analytics' && analytics && (
          <div>
            <div style={{ fontSize:13, color:'#535353', marginBottom:16, fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>
              Mood Breakdown
            </div>

            {analytics.breakdown.map(function(item, i) {
              const color = COLORS[item.emotion] || '#1DB954';
              return (
                <div key={i} style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <div style={{ fontSize:14, fontWeight:500 }}>
                      {EMOJI[item.emotion]} {item.emotion}
                    </div>
                    <div style={{ fontSize:13, color:'#535353' }}>
                      {item.count} scans · {item.percentage}%
                    </div>
                  </div>
                  <div style={{ height:6, background:'#1a1a1a', borderRadius:3, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', width: item.percentage + '%',
                      background: color, borderRadius:3,
                      transition:'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}

            <div style={{ fontSize:13, color:'#535353', margin:'24px 0 12px', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>
              Recent Scans
            </div>
            {analytics.recentHistory.map(function(item, i) {
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'10px 0', borderBottom:'1px solid #1a1a1a',
                }}>
                  <div style={{ fontSize:24 }}>{EMOJI[item.emotion] || '🎵'}</div>
                  <div>
                    <div style={{ fontWeight:600, textTransform:'capitalize' }}>{item.emotion}</div>
                    <div style={{ fontSize:12, color:'#535353' }}>
                      {((item.confidence || 0) * 100).toFixed(1)}% confidence
                    </div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:12, color:'#535353' }}>
                    {item.detectedAt ? item.detectedAt.substring(0,10) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feedback tab */}
        {tab === 'feedback' && (
          <div>
            <div style={{ fontSize:13, color:'#535353', marginBottom:16, fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>
              Song Feedback
            </div>
            {feedback.length === 0
              ? <div className="empty-state">
                  <div className="empty-icon">👍</div>
                  <div className="empty-title">No feedback yet</div>
                  <div className="empty-sub">Like or dislike songs from the result screen</div>
                </div>
              : feedback.map(function(f, i) {
                  return (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'12px 0', borderBottom:'1px solid #1a1a1a',
                    }}>
                      <div style={{ fontSize:24 }}>{f.liked ? '👍' : '👎'}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14 }}>{f.songTitle}</div>
                        <div style={{ fontSize:12, color:'#535353' }}>{f.songArtist}</div>
                      </div>
                      <div style={{
                        fontSize:11, color: COLORS[f.emotion] || '#1DB954',
                        fontWeight:600, textTransform:'capitalize',
                      }}>
                        {EMOJI[f.emotion]} {f.emotion}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;