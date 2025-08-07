import React, { useState } from 'react';
import axios from 'axios';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

const TranscriptionPage = () => {
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);

  const startRecording = () => {
    setRecording(true);
    recognition.start();
    recognition.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
  };

  const stopRecording = () => {
    setRecording(false);
    recognition.stop();
  };

  const saveTranscript = async () => {
    const userId = localStorage.getItem('userId');
    await axios.post('http://localhost:5000/transcripts', { content: transcript, userId });
    alert('Transcript saved');
  };

  return (
  <div className="container mt-5">
  <h2>Transcription</h2>
  <textarea className="form-control mb-3" rows="10" value={transcript} readOnly></textarea>
  <div className="btn-group">
    {!recording ? (
      <button className="btn btn-primary" onClick={startRecording}>Start</button>
    ) : (
      <button className="btn btn-warning" onClick={stopRecording}>Stop</button>
    )}
    <button className="btn btn-success" onClick={saveTranscript} disabled={!transcript}>Save</button>
  </div>
</div>

  );
};
export default TranscriptionPage;
