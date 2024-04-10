import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Form, Button, Container, Row, Col, Badge, Card, Alert, CloseButton } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

function Dropzone() {
  const [files, setFiles] = useState([]);
  const [showFileRejectionMessage, setShowFileRejectionMessage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Show rejection message if there are any rejected files
    setShowFileRejectionMessage(rejectedFiles.length > 0);
    setUploadSuccess(false);

    const newUniqueFiles = acceptedFiles.filter(af =>
      !files.some(f => f.name === af.name && f.size === af.size)
    );

    if (files.length + newUniqueFiles.length > 200) {
      alert('Cannot upload more than 200 files at once');
      return;
    }

    setFiles(prev => [...prev, ...newUniqueFiles]);
  }, [files]);


  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 200,
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = (fileName, fileSize) => {
    setFiles(currentFiles => currentFiles.filter(file => file.name !== fileName || file.size !== fileSize));
  };

  // Function to clear all files
  const clearFiles = () => {
    setFiles([]);
    setUploadSuccess(false);
  };

  const getFileTypeIndicator = (fileName) => {
    if (fileName.endsWith('.pdf')) {
      return 'PDF';
    } else if (fileName.endsWith('.docx')) {
      return 'DOCX';
    }
    return '';
  };


  // Helper function to truncate long file names
  const truncateFileName = (fileName, maxLength = 13) => {
    if (fileName.length > maxLength) {
      return `${fileName.substring(0, maxLength - 3)}...`;
    }
    return fileName;
  };

  const filesToShow = files;
  const fileRows = []; // Prepare rows for grid
  const filesPerRow = 6; // This should match your layout preference
  // Dynamically create grid rows and cols based on filesToShow
  filesToShow.forEach((file, index) => {
    const fileIndex = Math.floor(index / filesPerRow); // Calculate row index for the file
    if (!fileRows[fileIndex]) {
      fileRows[fileIndex] = []; // Initialize row
    }
    fileRows[fileIndex].push(file); // Push file to its respective row
  });

  const cardStyle = {
    minWidth: '130px', // Minimum width of the card
    minHeight: '50px', // Minimum height of the card
  };

  // Render rows and columns using Bootstrap's Grid system
  const renderFileGrid = () => (
    <div style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }}>
      {fileRows.map((row, rowIndex) => (
        <Row key={rowIndex} className="gy-4">
          {row.map((file, fileIndex) => (
            <Col key={`${file.path}-${fileIndex}`} sm="auto" md="auto" lg="auto" xl="auto" xxl="auto" className="mb-2">
              <Card className="h-100" style={cardStyle}>
                <Card.Body className="p-2">
                  <Card.Title className="mb-1" style={{ fontSize: '0.8rem' }}>
                    {truncateFileName(file.path)}
                  </Card.Title>
                  <Badge pill bg="secondary" size="sm" className="me-2">{getFileTypeIndicator(file.path)}</Badge>
                  <Button variant="outline-danger" size="sm" onClick={() => removeFile(file.name, file.size)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ))}
    </div>
  );


  const fileGridRows = [];
  for (let i = 0; i < renderFileGrid.length; i += filesPerRow) {
    const rowItems = renderFileGrid.slice(i, i + filesPerRow);
    fileGridRows.push(
      <Row key={i} className="gy-4">
        {rowItems}
      </Row>
    );
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file_uploads', file);
    });

    try {
      const endpoint = import.meta.env.VITE_FAST_API_ENDPOINT;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setTimeout(() => {
          console.log("File uploaded successfully");
          setFiles([]);
          setShowFileRejectionMessage(false); // Hide rejection message on successful upload
          setUploadSuccess(true); // Show success alert
        }, 1000);// Hide rejection message on successful upload
      } else {
        console.log("File upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };


  return (
    
    <Container className="mt-5">
      <Helmet>
      <title>Upload Files</title>
      <meta name='description' content='Upload files for process resuemes'/>
      </Helmet>
      <Form onSubmit={handleSubmit}>
        <div {...getRootProps({ className: 'dropzone p-3 mb-2 border border-dashed border-secondary rounded'})}>
          <input {...getInputProps()} />
          <p>Drag and drop some files here, or click to select files</p>
          <em>(Only *.pdf, *.docx, and *.doc files will be accepted)</em>
          <Button variant="outline-secondary" type="button" onClick={open} className="mt-2">Add File</Button>
        </div>
        <br></br>
        <aside>
          {showFileRejectionMessage && (
            <div className="alert alert-warning mt-2">Some files were rejected. Only *.pdf, *.docx files are accepted and you cannot upload more than 200 files at once.
              <CloseButton variant="" onClick={() => setUploadSuccess(false)} className="ms-2"></CloseButton>
            </div>
          )}
          {uploadSuccess && (
            <Alert variant="success">
              Files are uploaded successfully. You can continue or upload more files.<CloseButton variant="" onClick={() => setUploadSuccess(false)} className="ms-2"></CloseButton>
            </Alert>
          )}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <h4>
              Uploaded Resumes ({files.length} files)
              <Button variant="danger" type="button" onClick={clearFiles} className="ms-2">Delete All</Button>
            </h4>
          </div>
          <br></br>
          {renderFileGrid()}
        </aside>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="success" type='submit' className="mt-3">Upload</Button>
        </div>
        {/* Adjustments start here for the last button */}
        {uploadSuccess && (
          <div style={{ display: 'flex', justifyContent: 'center' }}> {/* Centering the button */}
            {/* Removing stylevariant (which seems to be a typo) and setting className for size and margin */}
            <Button variant="primary" type='button' className="mt-3">Continue</Button>
          </div>
        )}

      </Form>
    </Container>
  );
}


export default Dropzone;
