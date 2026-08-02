import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../api';

function Camera({ navigate, logout }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const detectionInterval = useRef(null);

  useEffect(() => { loadModels(); return () => stopCamera(); }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      setModelsLoaded(true);
    } catch { setModelsLoaded(false); }
    startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }, audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          startFaceTracking();
        };
      }
    } catch { alert('Camera access denied.'); }
  };

  const stopCamera = () => {
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const startFaceTracking = () => {
    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || !modelsLoaded) return;
      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
        );
        setFaceDetected(!!detection);
        if (overlayRef.current && videoRef.current) {
          const overlay = overlayRef.current;
          overlay.width = videoRef.current.videoWidth;
          overlay.height = videoRef.current.videoHeight;
          const ctx = overlay.getContext('2d');
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          if (detection) {
            const box = detection.box;
            ctx.strokeStyle = '#1DB954';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          }
        }
      } catch { }
    }, 300);
  };

  const captureFrame = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (modelsLoaded) {
      const detection = await faceapi.detectSingleFace(
        video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
      );
      if (detection) {
        const box = detection.box;
        const pad = 50;
        const x = Math.max(0, box.x - pad);
        const y = Math.max(0, box.y - pad);
        const w = Math.min(video.videoWidth - x, box.width + pad * 2);
        const h = Math.min(video.videoHeight - y, box.height + pad * 2);
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(video, x, y, w, h, 0, 0, w, h);
      } else {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
      }
    } else {
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
    }
    return canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
  };

  const startScan = async () => {
    if (!cameraReady || scanning) return;
    setScanning(true);

    const TOTAL = 5000;
    const INTERVAL = 1250;
    const captures = [];

    // Countdown display
    let remaining = 5;
    setCountdown(remaining);
    const countTimer = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) clearInterval(countTimer);
    }, 1000);

    // Take 4 captures over 5 seconds
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 0 : INTERVAL));
      try {
        const b64 = await captureFrame();
        captures.push(b64);
      } catch { }
    }

    // Wait for remaining time
    await new Promise(r => setTimeout(r, TOTAL - INTERVAL * 3));
    clearInterval(countTimer);
    setCountdown(null);

    // Send all captures to backend
    try {
      const res = await api.post('/emotion/detect-multi', { images: captures });
      stopCamera();
      navigate('result', res.data);
    } catch {
      alert('Detection failed. Make sure Spring Boot and FastAPI are running.');
      setScanning(false);
    }
  };

  return (
    <div className="camera-screen">
      <div className="topbar">
        <div className="topbar-logo">emo<span>tify</span></div>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={() => navigate('history')}>☰</button>
          <button className="icon-btn" onClick={logout}>↪</button>
          <button className="icon-btn" onClick={() => navigate('playlists')}>♪</button>
        </div>
      </div>
      <div className="camera-container">
        <div className="camera-label">
          {scanning && countdown !== null
            ? `Scanning... ${countdown}s`
            : !modelsLoaded ? 'Loading face detector...'
            : faceDetected ? '✓ Face detected — tap to scan'
            : 'Position your face in the frame'}
        </div>
        <div className="video-frame" style={{ position: 'relative' }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transform:'scaleX(-1)' }} />
          <canvas ref={overlayRef}
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none' }} />
          {scanning && countdown !== null && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#1DB954', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 700,
              }}>{countdown}</div>
            </div>
          )}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
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