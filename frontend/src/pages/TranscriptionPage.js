import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import MicVisualizer from '../components/MicVisualizer';
import { useNavigate } from 'react-router-dom';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const TranscriptionPage = () => {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const supported = !!SpeechRecognition;
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState('');
  const [isSlow, setIsSlow] = useState(false);
  const slowTimerRef = useRef(null);
  const recognizingRef = useRef(false);

  const startSlowTimer = () => {
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);
  };

  const stopSlowTimer = () => {
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    setIsSlow(false);
  };

  useEffect(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    
    rec.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    
    rec.onerror = (e) => {
      recognizingRef.current = false;
      setRecording(false);
      setError(`Speech recognition error: ${e?.error || 'unknown'}`);
      stopSlowTimer();
    };
    
    rec.onstart = () => {
      recognizingRef.current = true;
      setRecording(true);
      startSlowTimer();
    };
    
    rec.onend = () => {
      recognizingRef.current = false;
      setRecording(false);
      stopSlowTimer();
    };
    
    setRecognition(rec);
    return () => {
      try { rec.stop(); } catch (_) {}
      stopSlowTimer();
    };
  }, []);

  const startRecording = () => {
    if (!supported || !recognition || recognizingRef.current) return;
    setError('');
    try {
      recognition.start();
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please enable it.');
      } else {
        setError(`Speech recognition start failed: ${e.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (!supported || !recognition || !recognizingRef.current) return;
    try { recognition.stop(); } catch (_) {}
  };

  const saveTranscript = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('No user session found. Please login again.');
      return;
    }
    try {
      setError('');
      startSlowTimer();
      await api.post('/transcripts', { content: transcript, userId });
      setTranscript('');
      alert('Transcript saved successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to save transcript';
      setError(`Save failed: ${msg}`);
    } finally {
      stopSlowTimer();
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="page page-large container-fluid">
      <h2 className="page-title mb-3">Transcription</h2>
      {!supported && (
        <div className="alert alert-warning">
          Your browser does not support Web Speech API. Please use Chrome or enter text manually.
        </div>
      )}

      {isSlow && <div className="slow-banner mb-2">This is taking longer than usual...</div>}
      {error && <div className="alert alert-danger mb-2">{error}</div>}

      <div className="mb-3">
        <MicVisualizer isActive={recording} />
      </div>

      <textarea
        className="form-control mb-3"
        rows="10"
        value={transcript}
        onChange={e => setTranscript(e.target.value)}
        placeholder="Live transcript will appear here..."
      />

      <div className="d-flex flex-wrap gap-2 mt-3">
        {!recording && supported && (
          <button className="btn btn-primary" onClick={startRecording}>🎙 Start</button>
        )}
        {recording && (
          <button className="btn btn-warning" onClick={stopRecording}>⏹ Stop</button>
        )}
        <button className="btn btn-success" onClick={saveTranscript} disabled={!transcript}>💾 Save</button>
        <button className="btn btn-secondary ms-auto" onClick={handleGoBack}>← Back</button>
      </div>
    </div>
  );
};

export default TranscriptionPage;
