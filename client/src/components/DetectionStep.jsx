import { useState, useEffect } from "react";
import { Button, Container, Row, Col, Card, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import {
  ArrowRightCircle,
  CheckCircleFill,
  ArrowLeftCircle,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import axios from "axios";

import projImg1 from "../assets/img/1.png";
import projImg2 from "../assets/img/2.png";
import projImg3 from "../assets/img/gallery3.svg";

function DetectionStep({ onStepChange }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]); // Initialize images state
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Initialize current image index state

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const imageMap = {
    1: projImg1,
    2: projImg2,
    3: projImg3,
  };

  const handleFileButtonClick = (fileId) => {
    const imageList = batches.find(b => b.batchId === selectedBatchId)?.files
                     .filter(file => file.status === 'completed')
                     .map(file => imageMap[file.file_id] || '');
    setImages(imageList);
    setCurrentImageIndex(imageList.indexOf(imageMap[fileId]));
    setShowModal(true);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_FAST_API_STATUS);
      const formattedBatches = Object.entries(response.data).map(
        ([batchId, batchData]) => {
          const { start_date, files } = batchData;
          return {
            batchId,
            start_date,
            files,
            completed: files.filter(file => file.status === "completed").length,
            pending: files.filter(file => file.status === "pending").length,
            failed: files.filter(file => file.status === "failed").length,
          };
        }
      );

      setBatches(formattedBatches);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDetectClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onStepChange("ocr");
    }, 3000);
  };

  const handleReturnClick = () => {
    onStepChange("upload");
  };

  const handleBatchClick = (batchId) => {
    setSelectedBatchId(batchId);
  };

  const selectedBatch = batches.find(batch => batch.batchId === selectedBatchId);

  const containerStyle = (batchId) => ({
    backgroundColor: selectedBatchId === batchId ? "#e1d2ec" : "#f8f9fa",
    cursor: "pointer",
    position: "relative",
    borderWidth: "2px",
    borderColor: selectedBatchId === batchId ? "purple" : "transparent",
    boxSizing: "border-box",
  });

  return (
    <>
      <style type="text/css">
        {`
    .form-control:focus, .form-select:focus {
      box-shadow: 0 0 0 0.25rem rgba(130, 38, 158, 0.5);
      border: rgba(130, 38, 158, 0.5);
    }
    .sticky-title {
      position: sticky;
      top: 0;
      background-color: white;
      z-index: 1020;
      padding: 12px 0;
      border-bottom: 1px solid #ddd;
      border-radius: 5px;
      width: 100%;
      box-sizing: border-box;
    }
    .card-container {
      padding-top: 2px;
    }
    .scrollable-column {
      overflow-y: auto;
      height: 600px;
    }
    .scrollable-column::-webkit-scrollbar {
      width: 10px;
    }
    .scrollable-column::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .scrollable-column::-webkit-scrollbar-thumb {
      background: #cc71c4;
      border-radius: 10px;
    }
    .scrollable-column::-webkit-scrollbar-thumb:hover {
      background: #a34b9b;
    }
  .info-header {
    font-weight: bold;
  }
  .info-text  {
    font-weight: normal;
    font-family: Ubuntu, sans-serif;
  }
`}
      </style>
      <Container fluid="md" className="mt-4 px-5 ">
        <Row className="justify-content-center match-container-1 mt-2 mb-4">
          <Col md={6} className="highlight-section scrollable-column">
            <div className="sticky-title text-center">
              <h3 className="fs-5 m-0 text-dark">Object Detection Step</h3>
            </div>
            <div className="card-container">
              {batches.map((batch) => (
                <Card
                  key={batch.batchId}
                  onClick={() => handleBatchClick(batch.batchId)}
                  style={containerStyle(batch.batchId)}
                  className="mt-2 px-1 py-1"
                >
                  <Card.Body>
                    <div className="info-header" style={{ fontSize: "15px" }}>
                      Date:{" "}
                      <span className="info-text">
                        {formatDate(batch.start_date)}
                      </span>
                    </div>
                    <div className="info-header" style={{ fontSize: "15px" }}>
                      Batch ID:{" "}
                      <span className="info-text">{batch.batchId}</span>
                    </div>
                    <div className="info-header" style={{ fontSize: "15px" }}>
                      Completed:{" "}
                      <span className="info-text">{batch.completed}</span>
                    </div>
                    <div className="info-header" style={{ fontSize: "15px" }}>
                      Pending:{" "}
                      <span className="info-text">{batch.pending}</span>
                    </div>
                    <div className="info-header" style={{ fontSize: "15px" }}>
                      Failed: <span className="info-text">{batch.failed}</span>
                    </div>
                    {selectedBatchId === batch.batchId && (
                      <CheckCircleFill
                        color="purple"
                        size={20}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                        }}
                      />
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>
          <Col md={6} className="detail-section scrollable-column">
            {selectedBatch ? (
              <>
                <div className="sticky-title text-center">
                  <h5 className="fs-5 m-0 text-dark">
                    Files in Batch {selectedBatch.batchId}
                  </h5>
                </div>
                {selectedBatch.files.map((file, index) => (
                  <Card key={index} className="mt-2">
                    <Card.Body>
                      <div className="mb-1" style={{ fontSize: "15px" }}>
                        File ID:
                        <span className="info-text"> {file.file_id}</span>
                      </div>
                      <div className="mb-1" style={{ fontSize: "15px" }}>
                        Process Type:
                        <span className="info-text"> {file.process_type}</span>
                      </div>
                      <div className="mb-1" style={{ fontSize: "15px" }}>
                        Status:<span className="info-text"> {file.status}</span>
                      </div>
                      <div className="mb-1" style={{ fontSize: "15px" }}>
                        Number of Pages:
                        <span className="info-text">
                          {" "}
                          {file.number_of_pages}
                        </span>
                      </div>
                      <div className="mb-1" style={{ fontSize: "15px" }}>
                        Save Path:
                        <span className="info-text"> {file.original_name}</span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleFileButtonClick(file.file_id)}
                        className="mt-2"
                        style={{
                          backgroundColor: "#942cd2",
                          borderColor: "#942cd2",
                        }}
                      >
                        Result
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </>
            ) : (
              <div className="text-center mt-3">
                Please select a batch to view files.
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <Row className="form-continue-section d-flex justify-content-center">
        <Button
          variant="outline-dark"
          className="mt-1 mb-5 btn-sm mx-3"
          size="lg"
          style={{ width: "150px" }}
          onClick={handleReturnClick}
        >
          Return <ArrowLeftCircle size={25} />
        </Button>
        <Button
          variant="outline-dark"
          disabled={!selectedBatch}
          className="mt-1 mb-5 btn-sm mx-3"
          size="lg"
          style={{ width: "150px" }}
          onClick={handleDetectClick}
        >
          Detect <ArrowRightCircle size={25} />
        </Button>
      </Row>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        style={{ marginTop: '40px', marginBottom: '20px'}}
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-dark">Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            src={images[currentImageIndex]}
            alt="Preview"
            style={{ width: "95%" }}
          />
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePreviousImage}>
            <ChevronLeft />
          </Button>
          <Button variant="secondary" onClick={handleNextImage}>
            <ChevronRight />
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

DetectionStep.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default DetectionStep;
