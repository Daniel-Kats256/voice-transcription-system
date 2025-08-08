import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import MicVisualizer from '../components/MicVisualizer';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const TranscriptionPage = () => {
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const supported = !!SpeechRecognition;
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState('');
  const [isSlow, setIsSlow] = useState(false);
  const slowTimerRef = useRef(null);
  const recognizingRef = useRef(false);

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
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    };
    rec.onstart = () => {
      recognizingRef.current = true;
      setRecording(true);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);
    };
    rec.onend = () => {
      recognizingRef.current = false;
      setRecording(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    };
    setRecognition(rec);

    return () => {
      try { rec.stop(); } catch (_) {}
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!supported || !recognition) return;
    if (recognizingRef.current) return;
    setError('');
    try {
      recognition.start();
    } catch (e) {
      if (e && e.name === 'InvalidStateError') {
        return;
      }
      setError(`Speech recognition start failed: ${e?.message || e}`);
    }
  };

  const stopRecording = () => {
    if (!supported || !recognition) return;
    if (!recognizingRef.current) return;
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
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);
      await api.post('/transcripts', { content: transcript, userId });
      alert('Transcript saved');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save transcript';
      setError(`Save failed: ${msg}`);
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    }
  };

  return (
    <div className="page page-large container-fluid">
      <h2 className="page-title mb-3">Transcription</h2>
      {!supported ? (
        <div className="alert alert-warning">
          Your browser does not support Web Speech API. Please use Chrome or enter text manually.
        </div>
      ) : null}

      {isSlow && (
        <div className="slow-banner mb-2">This is taking longer than usual. Possible causes: slow network, limited CPU, or microphone permission delay.</div>
      )}
      {error && (
        <div className="error-banner mb-2">{error}</div>
      )}

      <div className="mb-3">
        <MicVisualizer isActive={recording} />
      </div>

      <textarea className="form-control mb-3" rows="10" value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Live transcript will appear here..." />

      <div className="btn-group">
        {supported && !recording ? (
          <button className="btn btn-primary" onClick={startRecording}>Start</button>
        ) : null}
        {supported && recording ? (
          <button className="btn btn-warning" onClick={stopRecording}>Stop</button>
        ) : null}
        <button className="btn btn-success" onClick={saveTranscript} disabled={!transcript}>Save</button>
      </div>
    </div>
  );
};
export default TranscriptionPage;
