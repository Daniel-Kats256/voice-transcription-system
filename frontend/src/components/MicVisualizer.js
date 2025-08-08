import React, { useEffect, useRef, useState } from 'react';

const MicVisualizer = ({ isActive }) => {
  const [error, setError] = useState('');
  const [permission, setPermission] = useState('idle'); // idle | requesting | granted | denied | error
  const [levels, setLevels] = useState(new Array(16).fill(0));
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      stop();
      return;
    }

    let stopped = false;
    setPermission('requesting');

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stopped) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        setPermission('granted');

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        analyserRef.current = analyser;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          const bucketSize = Math.floor(bufferLength / 16);
          const buckets = new Array(16).fill(0).map((_, i) => {
            let sum = 0;
            for (let j = i * bucketSize; j < (i + 1) * bucketSize; j++) sum += dataArray[j];
            return Math.min(100, Math.round((sum / bucketSize) / 2));
          });
          setLevels(buckets);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Microphone access failed');
        setPermission(e.name === 'NotAllowedError' ? 'denied' : 'error');
      }
    }

    start();

    return () => {
      stopped = true;
      stop();
    };
  }, [isActive]);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (analyserRef.current) analyserRef.current.disconnect();
    analyserRef.current = null;
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  if (!isActive) return null;

  return (
    <div>
      {permission !== 'granted' && (
        <div className="alert alert-info py-2 mb-2">
          {permission === 'requesting' && 'Requesting microphone permission...'}
          {permission === 'denied' && 'Microphone permission denied. Please allow access to visualize sound.'}
          {permission === 'error' && `Microphone error: ${error}`}
        </div>
      )}
      <div className="mic-visualizer" aria-label="Live microphone levels">
        {levels.map((lvl, idx) => (
          <span key={idx} className="mic-bar" style={{ height: `${Math.max(8, lvl)}px` }} />
        ))}
      </div>
    </div>
  );
};

export default MicVisualizer;