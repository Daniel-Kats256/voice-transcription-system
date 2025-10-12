import React, { useState, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const DeafDashboard = () => {
  const [message, setMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  const slowTimerRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Text-to-Speech conversion
  const speakText = () => {
    if (!message.trim()) {
      setError('Please type a message before converting to voice.');
      return;
    }

    setError('');
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);

    try {
      const synth = window.speechSynthesis;
      if (!synth) {
        setError('Your browser does not support text-to-speech.');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsSlow(false);
      };
      synth.speak(utterance);
    } catch (err) {
      setError(`Speech synthesis failed: ${err.message || err}`);
      setIsSpeaking(false);
      setIsSlow(false);
    }
  };

  // ✅ Save the typed message as a transcript
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
      await api.post('/transcripts', { content: message, userId });
      alert('Message saved as transcript.');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save transcript';
      setError(`Save failed: ${msg}`);
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  const userName = localStorage.getItem('name') || 'User';

  return (
    <div className="page page-large container-fluid">
      <h2 className="page-title mb-3">Hello {userName}, please type for Voice Communication (Deaf User)</h2>

      {isSlow && (
        <div className="slow-banner mb-2">This is taking longer than usual. Please wait...</div>
      )}
      {error && (
        <div className="alert alert-danger mb-2">{error}</div>
      )}

      <textarea
        className="form-control mb-3"
        rows="10"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your message here to convert it to voice..."
      />

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          className="btn btn-primary"
          onClick={speakText}
          disabled={!message || isSpeaking}
        >
          🔊 Convert to Voice
        </button>
        <button
          className="btn btn-success"
          onClick={saveTranscript}
          disabled={!message}
        >
          💾 Save Message
        </button>
        <button
          className="btn btn-secondary ms-auto"
          onClick={handleGoBack}
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default DeafDashboard;
