import React, { useRef, useEffect, useState } from 'react';
import api from '../api';

function Camera({ navigate, logout }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

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

  const capture = async () => {
    if (!cameraReady) return;
    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      const res = await api.post('/emotion/detect', { image: base64 });
      stopCamera();
      navigate('result', res.data);
    } catch { alert('Detection failed. Make sure Spring Boot and FastAPI are running.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="camera-screen">
      <div className="topbar">
        <div className="topbar-logo">emo<span>tify</span></div>
        <div className="topbar-actions">
          <button className="icon-btn" title="History" onClick={() => navigate('history')}>☰</button>
          <button className="icon-btn" title="Logout" onClick={logout}>↪</button>
        </div>
      </div>
      <div className="camera-container">
        <div className="camera-label">Look straight at the camera and make a clear expression</div>
        <div className="video-frame">
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transform:'scaleX(-1)' }} />
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />
        </div>
        <canvas ref={canvasRef} style={{ display:'none' }} />
        {loading
          ? <div className="loading-overlay">
              <div className="spinner" />
              <div className="loading-text">Analyzing your emotion...</div>
            </div>
          : <button className="capture-btn" onClick={capture} style={{ opacity: cameraReady ? 1 : 0.5 }}>
              <div className="capture-inner">📸</div>
            </button>
        }
      </div>
    </div>
  );
}

export default Camera;