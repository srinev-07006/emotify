import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../api';

function Camera({ navigate, logout }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const modelsLoadedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const detectionInterval = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, []);

  const loadModels = async () => {
    console.log('Starting model load...');
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      console.log('Model load SUCCESS');
      modelsLoadedRef.current = true;
      setModelsLoaded(true);
      startCamera();
    } catch (err) {
      console.error('Model load FAILED:', err);
      modelsLoadedRef.current = false;
      setModelsLoaded(false);
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          startFaceTracking();
        };
      }
    } catch {
      alert('Camera access denied. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const startFaceTracking = () => {
    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || !modelsLoadedRef.current) return;
      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
        );

        console.log('Live detection:', detection);
        setFaceDetected(!!detection);

        // Draw face box on overlay canvas
        if (overlayRef.current && videoRef.current) {
          const overlay = overlayRef.current;
          const video = videoRef.current;
          overlay.width = video.videoWidth;
          overlay.height = video.videoHeight;
          const ctx = overlay.getContext('2d');
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          if (detection) {
            const box = detection.box;
            ctx.strokeStyle = '#1DB954';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          }
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, 300);
  };

  const capture = async () => {
    if (!cameraReady) return;
    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (modelsLoadedRef.current) {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
        );

        if (detection) {
          // Crop face with padding
          const box = detection.box;
          const pad = 60;
          const padTop = 90; // extra room above for forehead/hairline
          const x = Math.max(0, box.x - pad);
          const y = Math.max(0, box.y - padTop);
          const w = Math.min(video.videoWidth - x, box.width + pad * 2);
          const h = Math.min(video.videoHeight - y, box.height + pad + padTop);
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(video, x, y, w, h, 0, 0, w, h);
        } else {
          // No face detected — use full frame
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
        }
      } else {
        // Models not loaded — use full frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
      }

      const base64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      const res = await api.post('/emotion/detect', { image: base64 });
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      stopCamera();
      navigate('result', res.data);
    } catch {
      alert('Detection failed. Make sure Spring Boot and FastAPI are running.');
    } finally {
      setLoading(false);
    }
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
        <div className="camera-label">
          {!modelsLoaded
            ? 'Loading face detector...'
            : faceDetected
              ? '✓ Face detected — tap to scan'
              : 'Position your face in the frame'}
        </div>

        <div className="video-frame" style={{ position: 'relative' }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: 'scaleX(-1)'
            }} />
          <canvas ref={overlayRef}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              transform: 'scaleX(-1)',
              pointerEvents: 'none'
            }} />
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {loading
          ? <div className="loading-overlay">
              <div className="spinner" />
              <div className="loading-text">Analyzing your emotion...</div>
            </div>
          : <button
              className="capture-btn"
              onClick={capture}
              style={{ opacity: cameraReady ? 1 : 0.5 }}
            >
              <div className="capture-inner">📸</div>
            </button>
        }

        <div style={{ fontSize: 12, color: '#535353', textAlign: 'center', padding: '0 24px' }}>
          Make a clear expression and look directly at the camera
        </div>
      </div>
    </div>
  );
}

export default Camera;