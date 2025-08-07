import React, { useState, useEffect } from 'react';
import api from '../api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const TranscriptionPage = () => {
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(!!SpeechRecognition);
  const [recognition, setRecognition] = useState(null);

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
    rec.onerror = () => setRecording(false);
    setRecognition(rec);
  }, []);

  const startRecording = () => {
    if (!supported || !recognition) return;
    setRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    if (!supported || !recognition) return;
    setRecording(false);
    recognition.stop();
  };

  const saveTranscript = async () => {
    await api.post('/transcripts', { content: transcript });
    alert('Transcript saved');
  };

  return (
    <div className="container mt-5">
      <h2>Transcription</h2>
      {!supported ? (
        <div className="alert alert-warning">
          Your browser does not support Web Speech API. Please use Chrome or enter text manually.
        </div>
      ) : null}
      <textarea className="form-control mb-3" rows="10" value={transcript} onChange={e => setTranscript(e.target.value)}></textarea>
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
