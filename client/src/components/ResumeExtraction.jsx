import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Modal,
  Spinner,
  Badge,
} from "react-bootstrap";
import PropTypes from "prop-types";
import {
  ArrowRightCircle,
  CheckCircleFill,
  ArrowLeftCircle,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

function ResumeExtraction({ onStepChange }) {
  const [batches, setBatches] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [isDetected, SetIsDetected] = useState(false);
  const [detectionResults, setDetectionResults] = useState([]);
  const [isOcr, setIsOcr] = useState(false);
  const [OcrResults, setOcrResults] = useState([]);
  const [isClassification, setIsClassification] = useState(false);
  const [classificationResults, setClassificationResults] = useState([]);
  const [isNer, setIsNer] = useState(false);
  const [nerResults, setNerResults] = useState([]);

  {
    /******** Initilization **********/
  }
  const navigate = useNavigate();

  {
    /******** Fetch API **********/
  }
  const fetchStatus = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_FAST_API_STATUS);
      const formattedBatches = Object.entries(response.data).map(
        ([batchId, batchData]) => {
          const {
            start_date,
            files,
            detection_status,
            ocr_status,
            classification_status,
            ner_status,
          } = batchData;
          return {
            batchId,
            start_date,
            files,
            completed: files.filter(
              (file) => file.conversion_status === "completed"
            ).length,
            pending: files.filter(
              (file) => file.conversion_status === "pending"
            ).length,
            failed: files.filter((file) => file.conversion_status === "failed")
              .length,
            detection_status,
            ocr_status,
            classification_status,
            ner_status,
          };
        }
      );
      setBatches(formattedBatches);
      console.log("Fetched status:", formattedBatches);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  {
    /******** Handle button clicks **********/
  }

  const handleFileButtonClick = (fileId) => {
    const fileDetails = detectionResults[fileId] || [];
    const imageUrls = fileDetails.map((filePath) => {
      const pathParts = filePath.split("\\");
      const storageName = pathParts[pathParts.length - 2];
      const fileName = pathParts[pathParts.length - 1];
      return `${
        import.meta.env.VITE_FAST_API_BASE_URL
      }files/${storageName}/${fileName}`;
    });
    console.log("Image URLs:", imageUrls);
    if (imageUrls.length > 0) {
      setImages(imageUrls);
      setCurrentImageIndex(0);
      setShowModal(true);
    } else {
      console.error("No images found for file ID:", fileId);
    }
  };

  const handleDetectClick = async () => {
    if (selectedBatchIds.length === 0) return;

    console.log("Selected Batch IDs:", selectedBatchIds);
    setIsAnimating(true);
    try {
      const response = await axios.post(import.meta.env.VITE_FAST_API_DETECT, {
        batch_ids: selectedBatchIds,
      });
      setDetectionResults(response.data);
      console.log("Detection results:", response.data);
      SetIsDetected(true);
    } catch (error) {
      console.error("Detection failed:", error.response || error);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleBatchClick = (batchId) => {
    setSelectedBatchIds((prevIds) => {
      if (prevIds.includes(batchId)) {
        return prevIds.filter((id) => id !== batchId); // Toggle off
      } else {
        return [...prevIds, batchId]; // Toggle on
      }
    });
  };

  const handleReturnClick = () => {
    onStepChange("upload");
  };

  const handleOcrClick = async () => {
    setIsAnimating(true);
    try {
      const response = await axios.post(import.meta.env.VITE_FAST_API_OCR, {
        batch_ids: selectedBatchIds,
      });
      setOcrResults(response.data);
      console.log("OCR results:", response.data);
      SetIsOcr(true);
    } catch (error) {
      console.error("OCR failed:", error.response || error);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleClassifyClick = async () => {
    setIsAnimating(true);
    // API call for classification
    setIsAnimating(false);
    setIsClassification(true);
  };

  const handleNerClick = async () => {
    setIsAnimating(true);
    // API call for NER
    setIsAnimating(false);
    setIsNer(true);
  };

  const handleMatchCvs = async () => {
    setIsAnimating(true);
    // Assuming any necessary final checks or setups before navigating
    setIsAnimating(false);
    navigate("/match"); // Navigating to MatchPage after processes are complete
  };

  const getButtonProps = () => {
    if (isNer) {
      return { label: "Match CVs", onClick: handleMatchCvs };
    } else if (isClassification) {
      return { label: "Proceed NER", onClick: handleNerClick };
    } else if (isOcr) {
      return { label: "Classify", onClick: handleClassifyClick };
    } else if (isDetected) {
      return { label: "Proceed OCR", onClick: handleOcrClick };
    } else {
      return { label: "Detect", onClick: handleDetectClick };
    }
  };

  const { label, onClick } = getButtonProps();

  {
    /******** Handle modal actions **********/
  }
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  {
    /******** Format code **********/
  }
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

  const containerStyle = (batchId) => ({
    backgroundColor: isDetected
      ? "#f8f9fa"
      : selectedBatchIds.includes(batchId)
      ? "#e1d2ec"
      : "#f8f9fa",
    cursor: isDetected ? "default" : "pointer",
    position: "relative",
    borderWidth: "2px",
    borderColor: isDetected
      ? "transparent"
      : selectedBatchIds.includes(batchId)
      ? "purple"
      : "transparent",
    boxSizing: "border-box",
    pointerEvents: isDetected ? "none" : "auto",
  });

  if (!batches) {
    return (
      <Container fluid="md" className="mt-4 px-5 detection-layout">
        <Spinner animation="grow" size="lg" />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Resumes Info Extraction</title>
        <meta
          name="description"
          content="information extraction step from resumes"
        />
      </Helmet>
      <Container fluid="md" className="mt-4 px-5 detection-layout">
        <Row className="justify-content-center match-container-1 mt-2 mb-4">
          <Col md={6} className="highlight-section scrollable-column">
            <div className="sticky-title text-center">
              <h3 className="fs-6 m-0 text-dark">Object Detection Step</h3>
            </div>
            <div className="card-container mb-2">
              {batches
                .filter(
                  (batch) =>
                    !isDetected || selectedBatchIds.includes(batch.batchId)
                )
                .map((batch) => (
                  <Card
                    key={batch.batchId}
                    onClick={() =>
                      !isDetected && handleBatchClick(batch.batchId)
                    }
                    style={containerStyle(batch.batchId)}
                    className="mt-2"
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
                      <br />
                      {isDetected ? (
                        <>
                          <Badge
                            bg={
                              batch.detection_status === "completed"
                                ? "success"
                                : "secondary"
                            }
                          >
                            Detection{" "}
                            {batch.detection_status === "completed"
                              ? "completed"
                              : "pending"}
                          </Badge>{" "}
                          <Badge
                            bg={
                              batch.classification_status === "completed"
                                ? "success"
                                : "secondary"
                            }
                          >
                            Classification{" "}
                            {batch.classification_status === "completed"
                              ? "completed"
                              : "pending"}
                          </Badge>{" "}
                          <Badge
                            bg={
                              batch.ner_status === "completed"
                                ? "success"
                                : "secondary"
                            }
                          >
                            NER{" "}
                            {batch.ner_status === "completed"
                              ? "completed"
                              : "pending"}
                          </Badge>{" "}
                          <Badge
                            bg={
                              batch.ocr_status === "completed"
                                ? "success"
                                : "secondary"
                            }
                          >
                            OCR{" "}
                            {batch.ocr_status === "completed"
                              ? "completed"
                              : "pending"}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <div
                            className="info-header"
                            style={{ fontSize: "15px" }}
                          >
                            Completed:{" "}
                            <span className="info-text">{batch.completed}</span>
                          </div>
                          <div
                            className="info-header"
                            style={{ fontSize: "15px" }}
                          >
                            Pending:{" "}
                            <span className="info-text">{batch.pending}</span>
                          </div>
                          <div
                            className="info-header"
                            style={{ fontSize: "15px" }}
                          >
                            Failed:{" "}
                            <span className="info-text">{batch.failed}</span>
                          </div>
                          {selectedBatchIds.includes(batch.batchId) && (
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
                        </>
                      )}
                    </Card.Body>
                  </Card>
                ))}
            </div>
          </Col>
          <Col md={6} className="detail-section scrollable-column">
            {selectedBatchIds
              .map((batchId) =>
                batches.find((batch) => batch.batchId === batchId)
              )
              .map((selectedBatch, idx) => (
                <div key={idx}>
                  <div className="sticky-title text-center">
                    <h4 className="fs-6 mb-2 mt-2 text-dark">
                      Batch {selectedBatch.batchId}
                      <br />
                      Uploaded on {formatDate(selectedBatch.start_date)}
                    </h4>
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
                          <span className="info-text">
                            {" "}
                            {file.process_type}
                          </span>
                        </div>
                        <div className="mb-1" style={{ fontSize: "15px" }}>
                          Upload Status:
                          <span className="info-text"> {file.status}</span>
                        </div>
                        <div className="mb-1" style={{ fontSize: "15px" }}>
                          Number of Pages:
                          <span className="info-text">
                            {" "}
                            {file.number_of_pages}
                          </span>
                        </div>
                        <div className="mb-1" style={{ fontSize: "15px" }}>
                          File Name:
                          <span className="info-text">
                            {" "}
                            {file.original_name}
                          </span>
                        </div>
                        {isDetected && (
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
                            Results
                          </Button>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ))}
            {selectedBatchIds.length === 0 && (
              <div className="text-center mt-3">
                Please select which uploaded files to be detected.
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <Row className="form-continue-section d-flex justify-content-center">
        {!isDetected && (
          <Button
            variant="outline-dark"
            className="mt-1 mb-5 btn-sm mx-3"
            size="lg"
            style={{ width: "150px" }}
            onClick={handleReturnClick}
          >
            Return <ArrowLeftCircle size={25} />
          </Button>
        )}
        <Button
          variant="outline-dark"
          disabled={selectedBatchIds.length === 0 || isAnimating}
          className={`mt-1 mb-5 btn-sm mx-3 ${isDetected ? "mx-auto" : ""}`} // Add `mx-auto` to center the button when alone
          size="lg"
          style={{ width: "150px" }}
          onClick={onClick}
        >
          {isAnimating ? (
            <Spinner animation="border" />
          ) : (
            <>
              {label} <ArrowRightCircle size={25} />
            </>
          )}
        </Button>
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" className="mt-4">
    <Modal.Header closeButton className="text-center">
        <Modal.Title
            className="text-dark"
            style={{ width: "100%", textAlign: "center", fontSize: "20px" }}
        >
            File Name Result
        </Modal.Title>
    </Modal.Header>
    <Modal.Body
        className="d-flex align-items-center justify-content-center"
        style={{ overflow: "hidden", minHeight: "500px" }}
    >
        <Row>
            <Col
                className="text-dark"
                md={6}
                style={{ overflowY: "auto", maxHeight: "100%" }}
            >
                <div
                    className="sticky-title text-center text-white"
                    style={{
                        padding: "10px",
                        border: "2px solid #942cd2",
                        marginBottom: "20px",
                        backgroundColor: "#942cd2",
                        borderRadius: "5px",
                    }}
                >
                    <h5 style={{ textAlign: "center", margin: "0", fontSize: "17px" }}>Text Extraction from image</h5>
                </div>
                {Object.entries(OcrResults.results || {}).map(([key, texts]) => (
                    texts.map((text, index) => (
                        <div key={`${key}-${index}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "10px",
                                border: "1px solid #000",
                                padding: "5px",
                            }}
                        >
                            <div style={{ width: "20px", textAlign: "center" }}>{index}</div>
                            <div style={{ marginLeft: "10px" }}>{text}</div>
                        </div>
                    ))
                ))}
            </Col>
            <Col md={6}>
                <div
                    className="sticky-title text-center text-white"
                    style={{
                        padding: "10px",
                        border: "2px solid #942cd2",
                        marginBottom: "20px",
                        backgroundColor: "#942cd2",
                        borderRadius: "5px",
                    }}
                >
                    <h5 style={{ textAlign: "center", margin: "0", fontSize: "17px" }}>Object Detection</h5>
                </div>
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <img
                        src={images[currentImageIndex]}
                        alt={`Preview ${currentImageIndex + 1}`}
                        style={{ maxWidth: "101%", maxHeight: "101%" }}
                    />
                </div>
                <div className="d-flex justify-content-center">
                    <Button
                        variant="danger"
                        onClick={handlePreviousImage}
                        className="me-2 mt-2"
                        style={{ backgroundColor: "#942cd2", border: "#942cd2" }}
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleNextImage}
                        className="ms-2 mt-2"
                        style={{ backgroundColor: "#942cd2", border: "#942cd2" }}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </Col>
        </Row>
    </Modal.Body>
    <Modal.Footer className="d-flex justify-content-center">
        <Button
            variant="danger"
            onClick={handleCloseModal}
            style={{ backgroundColor: "#942cd2", border: "#942cd2" }}
        >
            Close
        </Button>
    </Modal.Footer>
</Modal>

    </>
  );
}

ResumeExtraction.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default ResumeExtraction;
