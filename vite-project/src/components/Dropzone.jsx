import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
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
        <Row key={rowIndex} className="gy-4">
          {row.map((file, fileIndex) => (
            <Col
              key={`${file.path}-${fileIndex}`}
              sm="auto"
              md="auto"
              lg="auto"
              xl="auto"
              xxl="auto"
              className="mb-2"
            >
              <Card className="h-100" style={cardStyle}>
                <Card.Body className="p-2">
                  <Card.Title className="mb-1" style={{ fontSize: "0.8rem" }}>
                    {truncateFileName(file.path)}
                  </Card.Title>
                  <Badge pill bg="secondary" size="sm" className="me-2">
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
      style={{ overflowY: "auto", maxHeight: "300px", marginTop: "1rem" }}
    >
      {files.map((file, index) => (
        <ListGroup.Item
          key={`${file.path}-${index}`}
          className="d-flex justify-content-between align-items-center"
        >
          {file.name}
          <div>
            <Badge pill bg="secondary" className="me-2">
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
          <Alert variant="success" dismissible className="m-3">
            Files are uploaded successfully. You can continue or upload more
            files.
          </Alert>
        )}
      </div>
      <Container>
        <Form onSubmit={handleSubmit} className="p-3 mt-3 border">
          <div {...getRootProps({ className: "mt-3 dropzone" })}>
            <input {...getInputProps()} />
            <p>Drag and drop some files here, or click to select files</p>
            <em style={{ fontWeight: "bolder" }}>
              (Only *.pdf, *.docx files will be accepted)
            </em>
            <Button
              variant="outline-secondary"
              onClick={open}
              size="sm"
              className="mt-2"
            >
              Add File
            </Button>
          </div>
          <div className="m-3">
            {files.length > 0 && (
              <ToggleButtonGroup
                type="radio"
                name="viewMode"
                value={viewMode}
                onChange={handleViewModeChange}
                className="mb-3"
              >
                <ToggleButton
                  id="toggle-list"
                  value="list"
                  variant="outline-secondary"
                >
                  List
                </ToggleButton>
                <ToggleButton
                  id="toggle-grid"
                  value="grid"
                  variant="outline-secondary"
                >
                  Grid
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            <div className="d-flex justify-content-between align-items-center uploaded-resumes-header">
              {files.length > 0 && (
                <h4 className="mb-0">Preview ({files.length} files)</h4>
              )}
              {files.length > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={clearFiles}
                  className=""
                >
                  Delete All
                </Button>
              )}
            </div>
            {viewMode === "grid" ? renderFileGrid() : renderFileList()}
            <div className="mt-2 d-flex justify-content-center">
              <div className="form-submit-section">
                {files.length > 0 && (
                  <Button
                    variant="success"
                    type="submit"
                    disabled={isUploading}
                    className="mt-3"
                    size="sm"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
        {uploadSuccess && (
          <div className="form-continue-section ">
            <Button variant="primary" className="mt-3" size="sm">
              Continue
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}

export default Dropzone;
