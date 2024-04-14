import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import spectrumGradient from '../assets/img/spectrum-gradient.svg';
import Img from "../assets/img/file-arrow-up.svg";

import { ArrowRightCircle, CloudUpload } from 'react-bootstrap-icons';
import { X } from 'react-bootstrap-icons';
import { CloudArrowUp } from 'react-bootstrap-icons';

import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Badge,
  Card,
  Alert,
  ToggleButtonGroup,
  ListGroup,
  ToggleButton,
} from "react-bootstrap";
import { Helmet } from "react-helmet-async";


  

function Dropzone() {
  const [isHovering, setIsHovering] = useState(false);
  const [files, setFiles] = useState([]);
  const [showFileRejectionMessage, setShowFileRejectionMessage] =
    useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setShowFileRejectionMessage(rejectedFiles.length > 0);

      const newUniqueFiles = acceptedFiles.filter(
        (af) => !files.some((f) => f.name === af.name && f.size === af.size)
      );

      if (files.length + newUniqueFiles.length > 200) {
        alert("Cannot upload more than 200 files at once");
        return;
      }

      setFiles((prev) => [...prev, ...newUniqueFiles]);
    },
    [files]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 200,
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = (fileName, fileSize) => {
    setFiles((currentFiles) =>
      currentFiles.filter(
        (file) => file.name !== fileName || file.size !== fileSize
      )
    );
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadSuccess(false);
  };

  const getFileTypeIndicator = (fileName) => {
    if (fileName.endsWith(".pdf")) {
      return "PDF";
    } else if (fileName.endsWith(".docx")) {
      return "DOCX";
    }
    return "";
  };

  const truncateFileName = (fileName, maxLength = 13) => {
    if (fileName.length > maxLength) {
      return `${fileName.substring(0, maxLength - 3)}...`;
    }
    return fileName;
  };

  const filesToShow = files;
  const fileRows = [];
  const filesPerRow = 6;
  filesToShow.forEach((file, index) => {
    const fileIndex = Math.floor(index / filesPerRow);
    if (!fileRows[fileIndex]) {
      fileRows[fileIndex] = [];
    }
    fileRows[fileIndex].push(file);
  });

  const cardStyle = {
    minWidth: "130px",
    minHeight: "50px",
  };

  const renderFileGrid = () => (
    <div
      style={{
        maxHeight: "300px",
        overflowY: "auto",
        overflowX: "hidden",
        marginTop: "1rem",
      }}
    >
      {fileRows.map((row, rowIndex) => (
        <Row key={rowIndex} className="gy-4 mx-2">
          {row.map((file, fileIndex) => (
            <Col
              key={`${file.path}-${fileIndex}`}
              sm={6} // Adjust this value based on how many files you want per row
              md={4}
              lg={3}
              xl={2}
              className="mb-3"
            >
              <Card className="h-100 " style={cardStyle}>
                <Card.Body className="p-2">
                  <Card.Title className="mb-1" style={{ fontSize: "0.8rem" }}>
                    {truncateFileName(file.path)}
                  </Card.Title>
                  <Badge pill bg="dark" size="sm" className="me-2">
                    {getFileTypeIndicator(file.path)}
                  </Badge>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFile(file.name, file.size)}
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                    
                  >
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

  const renderFileList = () => (
    <ListGroup
      variant="flush"
      className="p-3"
      style={{ overflowY: "auto", maxHeight: "300px", marginTop: "1rem" }}
    >
      {files.map((file, index) => (
        <ListGroup.Item
          key={`${file.path}-${index}`}
          className="d-flex justify-content-between align-items-center bg-white rounded-3 mb-2 p-2"
        >
          {file.name}
          <div>
            <Badge pill bg="dark" className="me-2">
              {getFileTypeIndicator(file.name)}
            </Badge>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => removeFile(file.name, file.size)}
            >
              Delete
            </Button>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );

  const handleViewModeChange = (val) => {
    setViewMode(val);
  };

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

    setIsUploading(true); // Start upload process

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file_uploads", file);
    });

    try {
      const endpoint = import.meta.env.VITE_FAST_API_ENDPOINT;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setTimeout(() => {
          setIsUploading(false);
          setUploadSuccess(true);
          // Animation and state update logic remains here
          setTimeout(() => {
            // Optionally, clear or hide elements after the animation completes
            setFiles([]);
            setShowFileRejectionMessage(false);
          }, 500); // Match the duration of the animation
        }, 1000);
      } else {
        console.log("File upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Upload Files</title>
        <meta name="description" content="Upload files for process resumes" />
      </Helmet>
      <div className="alertContainer">
        {showFileRejectionMessage && (
          <Alert
            variant="warning"
            onClose={() => setShowFileRejectionMessage(false)}
            dismissible
            className="m-3"
          >
            Some files were rejected. Only *.pdf, *.docx files are accepted, and
            you cannot upload more than 200 files at once.
          </Alert>
        )}
        {uploadSuccess && (
          <Alert variant="success" dismissible className="m-2 fixed-bottom-alert">
            Files are uploaded successfully. You can continue or upload more
            files.
          </Alert>
        )}
      </div>
      <Container>
        
      <Form 
  onSubmit={handleSubmit} 
  className="p-3 mt-4 border-5 text-dark mb-5" 
  style={{
    backgroundImage: `url(${spectrumGradient})`,
    backgroundPosition: 'top center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    borderRadius:'40px',
    boxShadow:'5px 5px 30px #121212',
    
  }}
>
        <Row className="justify-content-center align-items-center p-2">
            <Col xs="auto">
            <img src={Img} alt="File Upload Icon" style={{ width: '48px', height: '48px', }} />
            </Col>
            <Col xs="auto" className="mt-3">
            <h1 className="text-center text-light file-upload">File Upload</h1>
           </Col>
        </Row>
        
          <div {...getRootProps({ className: "p-5 mt-2 dropzone" })} style={{marginLeft:'12px'}}>
            <input {...getInputProps()} />
            <p>Drag and drop some files here, or click to select files</p>
            <em style={{ fontWeight: "bolder" }}>
              (Only *.pdf, *.docx files will be accepted)
            </em>
            <Button
              variant="outline-dark"
              onClick={open}
              size="lg"
              className="mt-5 font-monospace fs-5"
            >
              Add File <CloudArrowUp size={29} />
            </Button>
          </div>
          <div className="mt-3 ">
            {files.length > 0 && (
              <ToggleButtonGroup
                type="radio"
                name="viewMode"
                value={viewMode}
                onChange={handleViewModeChange}
                className="mb-3 mt-2 mx-3 "
              >
                <ToggleButton
                  id="toggle-list"
                  value="list"
                  variant="btn btn-light border-dark"
                  className="px-4 py-2  font-monospace fs-5  " 
                >
                  List
                </ToggleButton>
                <ToggleButton
                  id="toggle-grid"
                  value="grid"
                  variant="btn btn-light border-dark"
                  className="px-4 py-2  font-monospace  fs-5" 
                >
                  Grid
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            <div className="d-flex justify-content-between align-items-center uploaded-resumes-header ">
              {files.length > 0 && (
                <h3 className="mb-0 mt-2 mx-3 text-light dropzone-title">Preview ({files.length} files)</h3>
              )}
              {files.length > 0 && (
                <Button variant="light" onClick={clearFiles} className="d-flex align-items-center justify-content-center mx-3 border-dark border-2 font-monospace fs-6">
                Delete All <X size={20} className="ms-1" />
              </Button>
              )}
            </div>
            {viewMode === "grid" ? renderFileGrid() : renderFileList()}
            <div className="mt-3 d-flex justify-content-center">
              <div className="form-submit-section">
                {files.length > 0 && (
                  <Button
                  variant={isHovering ? "outline-dark border-dark" : "btn btn-light border-dark"}
                    type="submit"
                    disabled={isUploading}
                    className="mt-5 font-monospace fs-5"
                    size="lg"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    
                
                  >
                    {isUploading ? "Uploading..." : "Upload"} <CloudUpload size={20} className="ms-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
        {uploadSuccess && (
         <div className="form-continue-section d-flex justify-content-center">
         <Button variant="outline-dark" className="mt-1 mb-5" size="lg">
           Next Step <ArrowRightCircle size={25} />
         </Button>
       </div>
        )}
      </Container>
      
    </>
    
  );
}

export default Dropzone;
