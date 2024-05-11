import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import spectrumGradient from "../assets/img/spectrum-gradient.svg";
import {
  ArrowRightCircle,
  CloudUpload,
  CheckCircleFill,
} from "react-bootstrap-icons";
import { X } from "react-bootstrap-icons";
import { CloudArrowUp } from "react-bootstrap-icons";
import PropTypes from "prop-types";

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

function Dropzone({ onStepChange }) {
  const [isHovering, setIsHovering] = useState(false);
  const [files, setFiles] = useState([]);
  const [showFileRejectionMessage, setShowFileRejectionMessage] =
    useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [uploadedFiles, setUploadedFiles] = useState(new Set());
  const [batchId, setBatchId] = useState(null);
  const [showUploadSuccessAlert, setShowUploadSuccessAlert] = useState(false);

useEffect(() => {
  const success = sessionStorage.getItem("uploadSuccess");
  console.log("Upload Success from sessionStorage:", success);

  if (success === "true") {
    setUploadSuccess(true);
  }
  // Clear the session storage item after checking it
  sessionStorage.removeItem("uploadSuccess");
}, []);

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

  const handleNextStep = () => {
    onStepChange("detect");
  };

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
  };

  const getFileTypeIndicator = (fileName) => {
    if (fileName.endsWith(".pdf")) {
      return "PDF";
    } else if (fileName.endsWith(".docx")) {
      return "DOCX";
    }
    return "";
  };

  const truncateFileName = (fileName, maxLength = 15) => {
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
              className="mb-3 font-monospace"
            >
              <Card className="h-100 " style={cardStyle}>
                <Card.Body className="p-2">
                  <Card.Title className="mb-1 " style={{ fontSize: "1rem" }}>
                    {truncateFileName(file.path)}
                  </Card.Title>
                  <Badge
                    pill
                    bg="dark"
                    size="sm"
                    className="me-2 font-monospace"
                  >
                    {getFileTypeIndicator(file.path)}
                  </Badge>
                  {uploadedFiles.has(file.name) && (
                    <CheckCircleFill
                      color="green"
                      className="me-2"
                    ></CheckCircleFill>
                  )}
                  <Button
                    variant="outline-danger "
                    className="font-monospace"
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
      className="font-monospace"
      style={{ overflowY: "auto", maxHeight: "300px", marginTop: "1rem" }}
    >
      {files.map((file, index) => (
        <ListGroup.Item
          key={`${file.path}-${index}`}
          className="d-flex justify-content-between align-items-center bg-white rounded-3 mb-2 p-2 font-monospace mx-3"
        >
          {file.name}

          <div>
            {uploadedFiles.has(file.name) && (
              <CheckCircleFill color="green" className="me-2"></CheckCircleFill>
            )}
            <Badge pill bg="dark" className="me-2 font-monospace">
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
      if (!uploadedFiles.has(file.name)) {
        formData.append("file_uploads", file);
      }
    });

    if (batchId) formData.append("batch_id", String(batchId));

    console.log(formData);
    try {
      const endpoint = import.meta.env.VITE_FAST_API_UPLOAD;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setBatchId(data.batch_id);
        console.log(response);
        setIsUploading(false);
        setUploadSuccess(true);
        setShowUploadSuccessAlert(true);
        console.log('Upload successful, setting sessionStorage');
        sessionStorage.setItem('uploadSuccess', 'true');
        setShowFileRejectionMessage(false);
        files.forEach((file) => uploadedFiles.add(file.name));
        setUploadedFiles(new Set(uploadedFiles));
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
        {showUploadSuccessAlert && (
          <Alert
            variant="success"
            dismissible
            onClose={()=> { setShowUploadSuccessAlert(false) }}
            className="m-2 fixed-bottom-alert"
          >
            Files are uploaded successfully. You can continue or upload more
            files.
          </Alert>
        )}
      </div>
      <Container>
        <Form
          onSubmit={handleSubmit}
          className="mt-4 border-5 text-dark pt-2 px-3 mx-5 mb-4 "
          style={{
            backgroundImage: `url(${spectrumGradient})`,
            backgroundPosition: "top center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            borderRadius: "30px",
          }}
        >
          <div
            {...getRootProps({
              className: "p-2 mt-2  dropzone font-monospace",
            })}
          >
            <input {...getInputProps()} />
            <p style={{ fontSize: "17px", marginBottom: "0.5rem" }}>
              Drag and drop some files here, or click to select files
            </p>
            <em style={{ fontWeight: "bolder", fontSize: "15px" }}>
              (Only *.pdf, *.docx files will be accepted)
            </em>
            <Button
              variant="outline-dark"
              onClick={open}
              size="sm"
              className="mt-2 font-monospace"
            >
              Add File <CloudArrowUp size={20} />
            </Button>
          </div>
          <div>
            {files.length > 0 && (
              <ToggleButtonGroup
                type="radio"
                name="viewMode"
                value={viewMode}
                onChange={handleViewModeChange}
                className="mb-3 mt-3  "
              >
                <ToggleButton
                  id="toggle-list"
                  value="list"
                  variant="btn btn-light border-dark"
                  className="  font-monospace fs-7  "
                >
                  List
                </ToggleButton>
                <ToggleButton
                  id="toggle-grid"
                  value="grid"
                  variant="btn btn-light border-dark"
                  className="  font-monospace  fs-7"
                >
                  Grid
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            <div className="d-flex justify-content-between align-items-center uploaded-resumes-header ">
              {files.length > 0 && (
                <h3 className=" mt-2 text-light dropzone-title">
                  Preview ({files.length} files)
                </h3>
              )}
              {files.length > 0 && (
                <Button
                  variant="light"
                  onClick={clearFiles}
                  className="d-flex align-items-center justify-content-center mx-3 border-dark border-2 font-monospace"
                  style={{ fontSize: "13px" }}
                >
                  Delete All <X size={15} className="ms-1" />
                </Button>
              )}
            </div>
            {viewMode === "list" ? renderFileList() : renderFileGrid()}
            <div className="mt-0 d-flex justify-content-center">
              <div className="form-submit-section">
                {files.length > 0 && (
                  <Button
                    variant={
                      isHovering
                        ? "outline-dark border-dark"
                        : "btn btn-light border-dark"
                    }
                    type="submit"
                    disabled={isUploading}
                    className="mt-2 mb-2 font-monospace"
                    size="lg"
                    style={{ fontSize: "13px" }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    {isUploading ? "Uploading..." : "Upload"}{" "}
                    <CloudUpload size={20} className="ms-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
        {uploadSuccess && (
          <div className="form-continue-section d-flex justify-content-center">
            <Button
              variant="outline-dark"
              className="mt-1 mb-5 btn-sm"
              size="lg"
              onClick={handleNextStep} // Call the step change function here
            >
              Next Step <ArrowRightCircle size={25} />
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}
Dropzone.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};
export default Dropzone;
