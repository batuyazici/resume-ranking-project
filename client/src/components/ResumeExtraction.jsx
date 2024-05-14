import React, { useState, useEffect } from "react";
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
  Dropdown,
  DropdownButton,
  Table,
  Form,
  Stack,
} from "react-bootstrap";
import PropTypes from "prop-types";
import {
  ArrowRightCircle,
  CheckCircleFill,
  ArrowLeftCircle,
  ChevronLeft,
  ChevronRight,
  ChevronExpand,
  ChevronContract,
  Trash,
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
  const [clsfLines, setClsfLines] = useState([]);
  const [changedClsfLines, setChangedClsfLines] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  const [isNer, setIsNer] = useState(false);
  const [nerResults, setNerResults] = useState([]);
  const [changedNerWords, setChangedNerWords] = useState([]);

  const [isCompleted, setIsCompleted] = useState(false);
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

  const handleFileButtonClick = (fileId, batchId) => {
    const fileDetails = detectionResults[fileId] || [];
    const imageUrls = fileDetails.map((filePath) => {
      const pathParts = filePath.split("\\");
      const storageName = pathParts[pathParts.length - 2];
      const fileName = pathParts[pathParts.length - 1];
      console.log(batches);
      const originalName =
        batches
          .find((b) => b.batchId === batchId)
          ?.files.find((f) => f.file_id === fileId)?.original_name ||
        "File or Batch not found";
      console.log("Original Name:", originalName);
      setCurrentFileId({
        fileId: fileId,
        storageName: storageName,
        originalName: originalName,
      });
      return `${
        import.meta.env.VITE_FAST_API_BASE_URL
      }files/${storageName}/${fileName}`;
    });
    if (imageUrls.length > 0) {
      setImages(imageUrls);
      if (isClassification) {
        setClsfLines(classificationResults.results[fileId] || []);
      } else if (isOcr) setOcrLines(OcrResults.results[fileId] || []);

      setCurrentImageIndex(0);
      setShowModal(true);
    } else {
      console.error("No images found for file ID:", fileId);
    }
  };

  const handleSubmitDeletions = async () => {
    try {
      if (isClassification && !isNer) {
        if (!currentFileId || changedClsfLines.length === 0) {
          console.error("No file selected or no lines to change");
          return;
        }
        const response = await axios.post(
          `${import.meta.env.VITE_FAST_API_BASE_URL}clsfiles/${
            currentFileId.storageName
          }/${currentFileId.fileId}`,
          {
            actions: changedClsfLines,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);
        const data = response.data;
        if (data && data[currentFileId.fileId]) {
          setClassificationResults((prevState) => ({
            results: {
              ...prevState.results,
              [currentFileId.fileId]: data[currentFileId.fileId],
            },
          }));
        }
        setChangedClsfLines([]);
      } else if (isNer) {
        if (!currentFileId || changedNerWords.length === 0) {
          console.error("No file selected or no lines to change");
          return;
        }
        const response = await axios.post(
          `${import.meta.env.VITE_FAST_API_BASE_URL}nerfiles/${
            currentFileId.storageName
          }/${currentFileId.fileId}`,
          {
            actions: changedNerWords,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);
        const data = response.data;
        if (data && data[currentFileId.fileId]) {
          setNerResults((prevState) => ({
            results: {
              ...prevState.results,
              [currentFileId.fileId]: data[currentFileId.fileId],
            },
          }));
        }
        setChangedNerWords([]);
      } else {
        if (!currentFileId || deletedLines.length === 0) {
          console.error("No file selected or no lines to delete");
          return;
        }
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
            deleted_lines: deletedLines,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data;
        if (data && data[currentFileId.fileId]) {
          setOcrResults((prevState) => ({
            results: {
              ...prevState.results,
              [currentFileId.fileId]: data[currentFileId.fileId],
            },
          }));
        }
        console.log("Deleted lines submitted:", response.data);
      }
      setDeletedLines([]); // Reset the list of deleted lines after successful submission
    } catch (error) {
      console.error("Failed to submit changes:", error);
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
      const classificationData = response.data;
      setClassificationResults(classificationData);
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
      const NerData = response.data;
      setNerResults(NerData);
      console.log(NerData);
      setIsNer(true);
    } catch (error) {
      console.error("NER failed:", error.response || error);
    } finally {
      setIsAnimating(false);
    }
  };
  const handleEmbedClick = async () => {
    setIsAnimating(true);
    try {
      const response = await axios.post(import.meta.env.VITE_FAST_API_EMBEDC, {
        batch_ids: selectedBatchIds,
      });
      console.log(response.data);
      setIsCompleted(true);
    } catch (error) {
      console.error("Embedding failed:", error.response || error);
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
    if (isCompleted) {
      return { label: "Match CVs", onClick: handleMatchCvs };
    } else if (isNer) { 
      return { label: "Complete process", onClick: handleEmbedClick };
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

  const handleDelete = (category, index) => {
    // Update state to reflect the deletion
    const updatedCategory = [...clsfLines[category]];
    updatedCategory.splice(index, 1);
    setClsfLines((prev) => ({ ...prev, [category]: updatedCategory }));

    // Log the delete action
    setChangedClsfLines((prev) => [
      ...prev,
      {
        action: "delete",
        fileId: currentFileId.fileId,
        category: category,
        index: index,
      },
    ]);
  };

  const handleClassChange = (newClass, oldClass, item, index) => {
    setClsfLines((prev) => {
      const newOldClassItems = prev[oldClass].filter((_, idx) => idx !== index); // Remove item from old class
      const newNewClassItems = prev[newClass]
        ? [...prev[newClass], item]
        : [item]; // Add item to new class

      return {
        ...prev,
        [oldClass]: newOldClassItems,
        [newClass]: newNewClassItems,
      };
    });

    setChangedClsfLines((prev) => [
      ...prev,
      {
        action: "change_class",
        fileId: currentFileId.fileId,
        oldClass: oldClass,
        newClass: newClass,
        item: item,
      },
    ]);
  };

const handleNerDelete = (batchId, category, index) => {
  const batchData = nerResults.results[batchId];
  const item = batchData[category][index];
  const updatedCategory = batchData[category].filter((_, idx) => idx !== index);

  setNerResults((prev) => ({
    ...prev,
    results: {
      ...prev.results,
      [batchId]: {
        ...batchData,
        [category]: updatedCategory,
      },
    },
  }));

  setChangedNerWords((prev) => [
    ...prev,
    {
      action: "delete",
      batchId,
      category,
      item: { ...item },
    },
  ]);
};

const handleNerChange = (batchId, category, itemIndex, newText, newLabel) => {
  const batchData = nerResults.results[batchId];
  const items = [...batchData[category]];
  const item = items[itemIndex];
  // Update item with new text and label if they are provided
  if (newText !== undefined) item.text = newText;
  if (newLabel !== undefined) item.label = newLabel;

  // Update the items array
  items[itemIndex] = item;
  setNerResults((prev) => ({
    ...prev,
    results: {
      ...prev.results,
      [batchId]: {
        ...batchData,
        [category]: items,
      },
    },
  }));

  // Log the change
  setChangedNerWords((prev) => [
    ...prev,
    {
      action: "change",
      batchId,
      category,
      index: itemIndex,
      newItem: { ...item },
    },
  ]);
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

  const toggleRow = (category, index) => {
    const key = `${category}-${index}`;
    const currentExpandedRows = { ...expandedRows };
    currentExpandedRows[key] = !currentExpandedRows[key];
    setExpandedRows(currentExpandedRows);
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
  const categories = Object.keys(clsfLines);
  
  const categoriesNer = (isNer) ? nerResults.results[currentFileId.fileId] : {};

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
                                  handleFileButtonClick(
                                    file.file_id,
                                    selectedBatch.batchId
                                  )
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
                {currentFileId.originalName}
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
                        Object Detection Results
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
                        {isNer
                          ? "Named Entity Recognition Results"
                          : isClassification
                          ? "Classification Results"
                          : "OCR Results"}
                      </h5>
                    </div>
                    {isNer ? (
                      <Accordion className="mb-3">
                        {Object.entries(categoriesNer).map(
                          ([category, items], idx) => (
                            <Accordion.Item eventKey={`${idx}`} key={category}>
                              <Accordion.Header>
                                {category.toUpperCase()}{" "}
                                <Badge bg="secondary">{items.length}</Badge>
                              </Accordion.Header>
                              <Accordion.Body>
                                {items.map((item, subIndex) => (
                                  <Form.Group className="mb-3" key={subIndex}>
                                    <Form.Label className="fw-bold">
                                      Text (Current Label:{" "}
                                      <Badge bg="info">{item.label}</Badge>)
                                    </Form.Label>
                                    <Stack direction="horizontal" gap={3}>
                                      <Form.Control
                                        defaultValue={item.text}
                                        onBlur={(e) =>
                                          handleNerChange(
                                            currentFileId.fileId,
                                            category,
                                            subIndex,
                                            e.target.value
                                          )
                                        }
                                        className="me-auto"
                                      />
                                      <DropdownButton
                                        id={`dropdown-label-change-${subIndex}`}
                                        title="Change Label"
                                        variant="outline-primary"
                                        align="end"
                                      >
                                        {[
                                          "person",
                                          "job title",
                                          "location",
                                          "email",
                                          "phone_number",
                                          "link",
                                          "university",
                                          "degree",
                                          "date",
                                          "designation",
                                          "years of experience",
                                        ].map((label, labelIndex) => (
                                          <Dropdown.Item
                                            key={labelIndex}
                                            onClick={() =>
                                              handleNerChange(
                                                currentFileId.fileId,
                                                category,
                                                subIndex,
                                                undefined,
                                                label
                                              )
                                            }
                                          >
                                            {label}
                                          </Dropdown.Item>
                                        ))}
                                      </DropdownButton>
                                      <Button
                                        variant="danger"
                                        onClick={() =>
                                          handleNerDelete(
                                            currentFileId.fileId,
                                            category,
                                            subIndex
                                          )
                                        }
                                      >
                                        <Trash />
                                      </Button>
                                    </Stack>
                                  </Form.Group>
                                ))}
                              </Accordion.Body>
                            </Accordion.Item>
                          )
                        )}
                      </Accordion>
                    ) : isClassification ? (
                      <Accordion defaultActiveKey="">
                        {categories.map((category, index) => (
                          <Accordion.Item eventKey={`${index}`} key={index}>
                            <Accordion.Header>
                              {category.toUpperCase()} (
                              {clsfLines[category].length})
                            </Accordion.Header>
                            <Accordion.Body>
                              <Table striped bordered hover size="sm">
                                <thead>
                                  <tr>
                                    <th>Text (Preview)</th>
                                    <th>Score</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {clsfLines[category].map((item, subIndex) => (
                                    <React.Fragment key={subIndex}>
                                      <tr
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          toggleRow(category, subIndex)
                                        }
                                      >
                                        <td>
                                          {expandedRows[
                                            `${category}-${subIndex}`
                                          ] ? (
                                            <ChevronContract size={20} />
                                          ) : (
                                            <ChevronExpand size={20} />
                                          )}
                                          {item.text.substring(0, 50)}
                                          {item.text.length > 50 ? "..." : ""}
                                        </td>
                                        <td>{item.score.toFixed(3)}</td>
                                        <td
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <DropdownButton
                                            title="Change Class"
                                            variant="secondary"
                                            size="sm"
                                            className="me-2"
                                            id={`dropdown-${category}-${subIndex}`}
                                            onSelect={(eventKey) =>
                                              handleClassChange(
                                                eventKey,
                                                category,
                                                item,
                                                subIndex
                                              )
                                            }
                                          >
                                            {categories.map(
                                              (option, optionIndex) => (
                                                <Dropdown.Item
                                                  key={optionIndex}
                                                  eventKey={option}
                                                >
                                                  {option}
                                                </Dropdown.Item>
                                              )
                                            )}
                                          </DropdownButton>
                                          <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row toggle
                                              handleDelete(category, subIndex);
                                            }}
                                          >
                                            <Trash />
                                          </Button>
                                        </td>
                                      </tr>
                                      {expandedRows[
                                        `${category}-${subIndex}`
                                      ] && (
                                        <tr>
                                          <td colSpan="3">
                                            <strong>Full Text:</strong>{" "}
                                            {item.text}
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </Table>
                            </Accordion.Body>
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
                    <div className="d-flex justify-content-center">
                      <Button
                        variant="primary"
                        onClick={handleSubmitDeletions}
                        disabled={
                          isNer
                            ? changedNerWords.length === 0
                            : isClassification
                            ? changedClsfLines.length == 0
                            : deletedLines.length === 0
                        }
                        className="mt-3"
                        style={{
                          backgroundColor: "#942cd2",
                          border: "#942cd2",
                        }}
                      >
                        Submit Changes
                      </Button>
                    </div>
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
