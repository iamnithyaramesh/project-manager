import React, { useState } from 'react';
import axios from 'axios';
import { FiUpload, FiFile, FiMail } from 'react-icons/fi';
import './Documents.css';

const Documents = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: '',
    from: ''
  });
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadedFiles([...uploadedFiles, {
        name: file.name,
        text: response.data.text,
        timestamp: new Date()
      }]);
      setExtractedText(response.data.text);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailParse = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/document/parse-email', emailContent);
      setExtractedText(response.data.content);
      setEmailContent({ subject: '', body: '', from: '' });
    } catch (error) {
      console.error('Error parsing email:', error);
      alert('Failed to parse email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <h1>Documents & Email</h1>
      </div>

      <div className="documents-content">
        <div className="upload-section">
          <div className="upload-card">
            <h2>Upload Document</h2>
            <div className="upload-area">
              <FiUpload size={40} />
              <p>Upload PDF, Word, or Text files</p>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="upload-btn">
                Choose File
              </label>
            </div>
            {loading && <p className="loading-text">Processing...</p>}
          </div>

          <div className="email-card">
            <h2>Parse Email</h2>
            <form onSubmit={handleEmailParse}>
              <div className="form-group">
                <label>From</label>
                <input
                  type="email"
                  value={emailContent.from}
                  onChange={(e) => setEmailContent({ ...emailContent, from: e.target.value })}
                  placeholder="sender@example.com"
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea
                  value={emailContent.body}
                  onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
                  rows="6"
                  placeholder="Email content"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                Parse Email
              </button>
            </form>
          </div>
        </div>

        {extractedText && (
          <div className="extracted-content">
            <h2>Extracted Content</h2>
            <div className="content-box">
              <pre>{extractedText}</pre>
            </div>
            <button
              className="btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText(extractedText);
                alert('Copied to clipboard!');
              }}
            >
              Copy Text
            </button>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h2>Uploaded Files</h2>
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="file-item">
                <FiFile size={20} />
                <div className="file-info">
                  <strong>{file.name}</strong>
                  <span>{file.timestamp.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;




