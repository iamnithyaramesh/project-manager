import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { FiUpload, FiFile, FiZap } from 'react-icons/fi';
import './Documents.css';

const Documents = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  
  // Fetch existing data on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch projects for task creation
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Upload Document
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const response = await axios.post('http://localhost:5000/api/document/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const newFile = { 
        name: file.name, 
        text: response.data.text, 
        timestamp: new Date(),
        id: response.data.id
      };

      setUploadedFiles([newFile, ...uploadedFiles]);
      setExtractedText(response.data.text);
      setExtractedTasks(response.data.extractedTasks || []);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to upload file: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create tasks from extracted tasks
  const createTasksFromDocument = async () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || 'mock-token';
      const response = await axios.post('http://localhost:5000/api/document/create-tasks-from-document', {
        documentId: uploadedFiles[0]?.id, // Use the latest uploaded document
        projectId: selectedProject,
        selectedTasks: selectedTasks.length > 0 ? selectedTasks : null
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert(`Successfully created ${response.data.count} tasks!`);
      setShowTaskModal(false);
      setSelectedTasks([]);
      setSelectedProject('');
    } catch (error) {
      console.error('Error creating tasks:', error);
      alert('Failed to create tasks');
    } finally {
      setLoading(false);
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (task) => {
    const isSelected = selectedTasks.some(t => t.number === task.number);
    if (isSelected) {
      setSelectedTasks(selectedTasks.filter(t => t.number !== task.number));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  return (
    <div className="documents-page">
      <Container className="py-5">

        {showSuccess && (
          <Row className="mb-4">
            <Col>
              <Alert variant="success" className="text-center">
                <FiZap className="me-2" /> Processed successfully!
              </Alert>
            </Col>
          </Row>
        )}

        {/* Upload Card */}
        <Row className="g-4 mb-5">
          <Col lg={12}>
            <Card className="h-100 upload-card border-0 shadow">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">
                  <FiUpload className="me-2" /> Upload SRS Document
                </h4>
              </Card.Header>
              <Card.Body className="p-4 text-center">
                <FiFile size={60} className="text-primary mb-3" />
                <h5>Drop your file here</h5>
                <p className="text-muted mb-4">Supports PDF, Word, and Text files</p>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                />
                <Button as="label" htmlFor="file-upload" variant="primary" size="lg" className="px-4">
                  <FiUpload className="me-2" /> Choose File
                </Button>
                {loading && (
                  <div className="text-center mt-3">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Processing...</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Past Documents */}
        {uploadedFiles.length > 0 && (
          <Row className="mb-5">
            <Col>
              <h4 className="mb-3">Past Documents</h4>
              {uploadedFiles.map((file, idx) => (
                <Card key={idx} className="mb-2 shadow-sm">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <FiFile className="me-2 text-primary" />
                      <strong>{file.name}</strong>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>{file.timestamp ? file.timestamp.toLocaleString() : 'Unknown time'}</div>
                    </div>
                    <Badge bg="success">Processed</Badge>
                  </Card.Body>
                </Card>
              ))}
            </Col>
          </Row>
        )}

        {/* Extracted Content */}
        {extractedText && (
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow">
                <Card.Header className="bg-info text-white">
                  <h4 className="mb-0">
                    <FiFile className="me-2" /> Extracted Content
                  </h4>
                </Card.Header>
                <Card.Body>
                  <div className="content-box bg-light p-3 rounded mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{extractedText}</pre>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => { navigator.clipboard.writeText(extractedText); alert('Copied!'); }}
                    >
                      <FiFile className="me-2" /> Copy Text
                    </Button>
                    {extractedTasks.length > 0 && (
                      <Button 
                        variant="success"
                        onClick={() => setShowTaskModal(true)}
                      >
                        <FiZap className="me-2" /> Create Tasks ({extractedTasks.length})
                    </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Task Creation Modal */}
        <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title><FiZap className="me-2" /> Create Tasks from Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <h6>Select Project</h6>
                    <Form.Select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Choose a project...</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
                    </Form.Select>
                </div>
                
            <div className="mb-3">
              <h6>Extracted Tasks ({extractedTasks.length})</h6>
              <div className="task-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {extractedTasks.map((task, index) => (
                  <div key={index} className="task-item border rounded p-3 mb-2">
                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="checkbox"
                        checked={selectedTasks.some(t => t.number === task.number)}
                        onChange={() => toggleTaskSelection(task)}
                        className="me-3 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>Task {task.number}: {task.title}</strong>
                            <div className="text-muted small mt-1">{task.description}</div>
                            </div>
                          <div className="text-end">
                            <Badge bg={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}>
                              {task.priority}
                            </Badge>
                            {task.estimatedHours && (
                              <div className="text-muted small">{task.estimatedHours}h</div>
                            )}
                          </div>
                        </div>
                        {task.skillsRequired && task.skillsRequired.length > 0 && (
                          <div className="mt-2">
                            {task.skillsRequired.map((skill, idx) => (
                              <Badge key={idx} bg="info" className="me-1">{skill}</Badge>
                      ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSelectedTasks(extractedTasks);
                  }}
                >
                  Select All
                </Button>
                <Button
                  variant="outline-secondary"
                  className="ms-2"
                  onClick={() => setSelectedTasks([])}
                >
                  Clear Selection
                </Button>
              </div>
              <div>
                <Button
                  variant="success"
                  onClick={createTasksFromDocument}
                  disabled={!selectedProject || loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" /> Creating...
                    </>
                  ) : (
                    <>
                      <FiZap className="me-2" /> Create {selectedTasks.length > 0 ? selectedTasks.length : extractedTasks.length} Tasks
                    </>
                  )}
                </Button>
              </div>
                </div>
          </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
};

export default Documents;