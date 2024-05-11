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
  ProgressBar,
  Accordion,
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
  const [initialLoading, setInitialLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [currentFileId, setCurrentFileId] = useState([]);

  const [isDetected, SetIsDetected] = useState(false);
  const [detectionResults, setDetectionResults] = useState([]);

  const [isOcr, setIsOcr] = useState(false);
  const [OcrResults, setOcrResults] = useState([]);
  const [ocrLines, setOcrLines] = useState([]);
  const [deletedLines, setDeletedLines] = useState([]);

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
      if (initialLoading) setInitialLoading(false);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    fetchStatus(); // Fetch immediately on mount
    const intervalId = setInterval(() => {
      fetchStatus();
    }, 5000); // Adjust to 6000 if you want it every 6 seconds

    return () => {
      clearInterval(intervalId);
    };
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
      setCurrentFileId({ fileId: fileId, storageName: storageName });
      return `${
        import.meta.env.VITE_FAST_API_BASE_URL
      }files/${storageName}/${fileName}`;
    });
    if (imageUrls.length > 0) {
      setImages(imageUrls);

      if (isOcr) setOcrLines(OcrResults.results[fileId] || []);
      setCurrentImageIndex(0);
      setShowModal(true);
    } else {
      console.error("No images found for file ID:", fileId);
    }
  };

  const handleSubmitDeletions = async () => {
    if (!currentFileId || deletedLines.length === 0) {
      console.error("No file selected or no lines to delete");
      return;
    }
    try {
      console.log(
        "Storage Name:",
        currentFileId.storageName,
        "File ID:",
        currentFileId.fileId
      );
      console.log("Deleted Lines:", deletedLines);
      const response = await axios.post(
        `${import.meta.env.VITE_FAST_API_BASE_URL}ocrfiles/${
          currentFileId.storageName
        }/${currentFileId.fileId}`,
        {
          deleted_lines: deletedLines, // This payload should match the server's expectations
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      if (data && data[currentFileId.fileId]) {
        setOcrResults(prevState => ({
          results: {
              ...prevState.results,
              [currentFileId.fileId]: data[currentFileId.fileId]
          }
      }));

    }
      console.log("Deleted lines submitted:", response.data);
      setDeletedLines([]); // Reset the list of deleted lines after successful submission
    } catch (error) {
      console.error("Failed to submit deletions:", error);
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

  const handleDetectClick = async () => {
    if (selectedBatchIds.length === 0) return;
    setIsAnimating(true);
    try {
      const response = await axios.post(import.meta.env.VITE_FAST_API_DETECT, {
        batch_ids: selectedBatchIds,
      });
      setDetectionResults(response.data);
      SetIsDetected(true);
    } catch (error) {
      console.error("Detection failed:", error.response || error);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleOcrClick = async () => {
    setIsAnimating(true);
    try {
      const response = await axios.post(import.meta.env.VITE_FAST_API_OCR, {
        batch_ids: selectedBatchIds,
      });
      setOcrResults(response.data);
      console.log();
      setIsOcr(true);
    } catch (error) {
      console.error("OCR failed:", error.response || error);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleClassifyClick = async () => {
    setIsAnimating(true);
    try {
      const response = await axios.post(import.meta.env.VITE_FAST_API_CLSF, {
        batch_ids: selectedBatchIds,
      });
      setClassificationResults(response.data);
      console.log();
      setIsClassification(true);
    } catch (error) {
      console.error("Clsf failed:", error.response || error);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleNerClick = async () => {
    setIsAnimating(true);
    try {
      const response = await axios.post(import.meta.env.VITE_FAST_API_NER, {
        batch_ids: selectedBatchIds,
      });
      setNerResults(response.data);
      console.log();
      setIsNer(true);
    } catch (error) {
      console.error("NER failed:", error.response || error);
    } finally {
      setIsAnimating(false);
    }
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

  const handleDeleteLine = (index) => {
    const newOcrLines = [...ocrLines];
    const deletedItem = newOcrLines.splice(index, 1); // Remove the item at the specified index
    setOcrLines(newOcrLines); // Update state with the remaining items
    setDeletedLines([...deletedLines, ...deletedItem]); // Add the deleted item to the deletedLines array
  };

  {
    /******** Format code **********/
  }
  const truncateText = (text, maxLength = 50) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

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

  const progressLabel = isNer
    ? "Embedding Step"
    : isClassification
    ? "NER"
    : isOcr
    ? "Classification"
    : isDetected
    ? "OCR"
    : "Object Detection";
  const progressPercentage = isNer
    ? 100
    : isClassification
    ? 75
    : isOcr
    ? 50
    : isDetected
    ? 25
    : 0;
  const headerText = isNer
    ? "All steps are completed"
    : isClassification
    ? "Keyword extraction"
    : isOcr
    ? "Classification for extracted texts"
    : isDetected
    ? "OCR for text extraction"
    : "Please select resumes to be processed";

  return (
    <>
      {initialLoading ? (
        <Container className="mt-4 d-flex justify-content-center">
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
          <Spinner animation="grow" className="big-spinner" />
        </Container>
      ) : (
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
                  <h3 className="fs-6 mb-1 text-dark">{headerText}</h3>
                  <div className="px-3 py-1">
                    <ProgressBar
                      animated
                      now={progressPercentage}
                      label={`${progressLabel}`}
                      className="custom-progress-bar"
                    />
                  </div>
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
                          <div
                            className="info-header"
                            style={{ fontSize: "15px" }}
                          >
                            Date:{" "}
                            <span className="info-text">
                              {formatDate(batch.start_date)}
                            </span>
                          </div>
                          <div
                            className="info-header"
                            style={{ fontSize: "15px" }}
                          >
                            Batch ID:{" "}
                            <span className="info-text">{batch.batchId}</span>
                          </div>
                          <br />
                          {isDetected ? (
                            <>
                              <Badge
                                style={{ marginRight: "5px" }}
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
                              </Badge>
                              <Badge
                                style={{ marginRight: "5px" }}
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
                              <Badge
                                style={{ marginRight: "5px" }}
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
                              </Badge>
                              <Badge
                                style={{ marginRight: "5px" }}
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
                              </Badge>
                            </>
                          ) : (
                            <>
                              <div
                                className="info-header"
                                style={{ fontSize: "15px" }}
                              >
                                Completed:{" "}
                                <span className="info-text">
                                  {batch.completed}
                                </span>
                              </div>
                              <div
                                className="info-header"
                                style={{ fontSize: "15px" }}
                              >
                                Pending:{" "}
                                <span className="info-text">
                                  {batch.pending}
                                </span>
                              </div>
                              <div
                                className="info-header"
                                style={{ fontSize: "15px" }}
                              >
                                Failed:{" "}
                                <span className="info-text">
                                  {batch.failed}
                                </span>
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
                                onClick={() =>
                                  handleFileButtonClick(file.file_id)
                                }
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

          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            size="xl"
            className="mt-4"
          >
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
                {isDetected && (
                  <Col md={isOcr ? 6 : 8} className="mx-auto">
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
                      <h5
                        style={{
                          textAlign: "center",
                          margin: "0",
                          fontSize: "17px",
                        }}
                      >
                        Object Detection
                      </h5>
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
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                      />
                    </div>
                    <div className="d-flex justify-content-center">
                      <Button
                        variant="danger"
                        onClick={handlePreviousImage}
                        className="me-2 mt-2"
                        style={{
                          backgroundColor: "#942cd2",
                          border: "#942cd2",
                        }}
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleNextImage}
                        className="ms-2 mt-2"
                        style={{
                          backgroundColor: "#942cd2",
                          border: "#942cd2",
                        }}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </Col>
                )}
                {isOcr && currentFileId && (
  <Col md={6} style={{ overflowY: "auto", maxHeight: "100%" }}>
    {isClassification ? (
      <Accordion defaultActiveKey="">
        {classificationResults.map((result, index) => (
          <Accordion.Item
            key={`${currentFileId.fileId}-classification-${index}`}
            eventKey={`${index}`}
          >
            <Accordion.Header
              style={{
                backgroundColor: "#e0e0e0", // Custom background for classification
                color: "#034f84" // Custom text color
              }}
            >
              {result.title} {/* Assuming 'title' is part of your classificationResults */}
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModifyClassification(index);
                }}
                style={{ marginLeft: "10px" }}
              >
                Modify
              </Button>
            </Accordion.Header>
            <Accordion.Body>{result.details}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    ) : isNer ? (
      <Accordion defaultActiveKey="">
        {nerResults.map((entity, index) => (
          <Accordion.Item
            key={`${currentFileId.fileId}-ner-${index}`}
            eventKey={`${index}`}
          >
            <Accordion.Header
              style={{
                backgroundColor: "#d0f0c0", // Custom background for NER
                color: "#2c662d" // Custom text color
              }}
            >
              {entity.name} {/* Assuming 'name' is a property of NER entities */}
              <Button
                variant="warning"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModifyNerEntity(index);
                }}
                style={{ marginLeft: "10px" }}
              >
                Edit
              </Button>
            </Accordion.Header>
            <Accordion.Body>{entity.detail}</Accordion.Body> {/* Assuming 'detail' is a property of NER entities */}
          </Accordion.Item>
        ))}
      </Accordion>
    ) : (
      <Accordion defaultActiveKey="">
        {ocrLines.map((text, index) => (
          <Accordion.Item
            key={`${currentFileId.fileId}-${index}`}
            eventKey={`${index}`}
          >
            <Accordion.Header>
              {truncateText(text)}
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion toggle
                  handleDeleteLine(index);
                }}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </Button>
            </Accordion.Header>
            <Accordion.Body>{text}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    )}
    <Button
      variant="primary"
      onClick={handleSubmitDeletions}
      disabled={deletedLines.length === 0}
      className="mt-3"
    >
      Submit Deletions
    </Button>
  </Col>
)}
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
      )}
    </>
  );
}

ResumeExtraction.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default ResumeExtraction;
