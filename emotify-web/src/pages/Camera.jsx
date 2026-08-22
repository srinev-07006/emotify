import React, { useRef, useEffect, useState } from 'react';
import api from '../api';

function Camera({ navigate, logout }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => { startCamera(); return () => stopCamera(); }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }, audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch { alert('Camera access denied.'); }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
  };

  const startScan = async () => {
    if (!cameraReady || scanning) return;
    setScanning(true);

    let remaining = 5;
    setCountdown(remaining);
    const countTimer = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) clearInterval(countTimer);
    }, 1000);

    const captures = [];
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 0 : 1250));
      try { captures.push(captureFrame()); } catch { }
    }

    await new Promise(r => setTimeout(r, 1250));
    clearInterval(countTimer);
    setCountdown(null);

    try {
      const res = await api.post('/emotion/detect-multi', { images: captures });
      stopCamera();
      navigate('result', res.data);
    } catch {
      alert('Detection failed. Make sure backend services are running.');
      setScanning(false);
    }
  };

  return (
    <div className="camera-screen">
      <div className="topbar">
        <div className="topbar-logo">emo<span>tify</span></div>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={() => navigate('profile')}>👤</button>
          <button className="icon-btn" onClick={() => navigate('playlists')}>♪</button>
          <button className="icon-btn" onClick={() => navigate('history')}>☰</button>
          <button className="icon-btn" onClick={logout}>↪</button>
        </div>
      </div>
      <div className="camera-container">
        <div className="camera-label">
          {scanning && countdown !== null
            ? `Scanning... ${countdown}s`
            : 'Look straight at the camera and make a clear expression'}
        </div>
        <div className="video-frame" style={{ position:'relative' }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transform:'scaleX(-1)' }} />
          {scanning && countdown !== null && (
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'rgba(0,0,0,0.4)',
            }}>
              <div style={{
                width:80, height:80, borderRadius:'50%',
                background:'#1DB954', color:'#000',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:36, fontWeight:700,
              }}>{countdown}</div>
            </div>
          )}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />
        </div>
        <canvas ref={canvasRef} style={{ display:'none' }} />
        {scanning
          ? <div className="loading-overlay">
              <div className="spinner" />
              <div className="loading-text">Analyzing emotions...</div>
            </div>
          : <button className="capture-btn" onClick={startScan}
              style={{ opacity: cameraReady ? 1 : 0.5 }}>
              <div className="capture-inner">📸</div>
            </button>
        }
        <div style={{ fontSize:12, color:'#535353', textAlign:'center', padding:'0 24px' }}>
          Hold still for 5 seconds — we'll detect your emotion over time
        </div>
      </div>
    </div>
  );
}

export default Camera;