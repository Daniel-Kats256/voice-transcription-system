import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TranscriptModal = ({ transcript, onHide }) => {
  return (
    <Modal show={!!transcript} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Transcript</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {transcript ? (
          <div>
            <div className="text-muted mb-2">{new Date(transcript.createdAt).toLocaleString()}</div>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{String(transcript.content || '')}</pre>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TranscriptModal;