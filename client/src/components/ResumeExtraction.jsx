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
  Alert,
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
  HourglassSplit,
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
  const [activeKey, setActiveKey] = useState("");

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
  const fetchStatus = async (selectedBatchIds = []) => {
    try {
      const apiUrl = isDetected
        ? `${
            import.meta.env.VITE_FAST_API_STATUS
          }?batch_ids=${selectedBatchIds.join(",")}`
        : import.meta.env.VITE_FAST_API_STATUS;

      const response = await axios.get(apiUrl);
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
    let intervalId;

    const fetchData = async () => {
      if (!isDetected) {
        await fetchStatus();
      } else {
        clearInterval(intervalId);
      }
    };

    fetchData();

    if (!isDetected) {
      intervalId = setInterval(fetchData, 2500);
    }

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetected]);

  const handleFetchAfterApiCall = async (selectedBatchIds) => {
    if (selectedBatchIds.length > 0) {
      try {
        await fetchStatus(selectedBatchIds);
      } catch (error) {
        console.error("Failed to fetch status after API call:", error);
      }
    }
  };

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

  const handleSelect = (eventKey) => {
    setActiveKey(activeKey === eventKey ? "" : eventKey);
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
      await handleFetchAfterApiCall(selectedBatchIds);
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
      await handleFetchAfterApiCall(selectedBatchIds);
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
      await handleFetchAfterApiCall(selectedBatchIds);
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
      await handleFetchAfterApiCall(selectedBatchIds);
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

  const handleNerDelete = (batchId, category, item) => {
    const batchData = nerResults.results[batchId];
    const updatedCategory = batchData[category].filter(
      (i) =>
        !(i.start === item.start && i.end === item.end && i.text === item.text)
    );

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
  const truncateText = (text, maxLength = 35) => {
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

  const progressSteps = [
    {
      label: "Object Detection",
      percentage: 0,
      header: "Select resume batches to process",
    },
    {
      label: "OCR",
      percentage: 25,
      header: "Extracting text from resumes",
    },
    {
      label: "Classification",
      percentage: 50,
      header: "Classifying extracted text",
    },
    {
      label: "NER",
      percentage: 75,
      header: "Extracting keywords with NER and regex",
    },
    {
      label: "Embedding Step",
      percentage: 100,
      header: "All processing steps completed",
    },
  ];

  let currentStep = 0;

  if (isDetected) currentStep = 1;
  if (isOcr) currentStep = 2;
  if (isClassification) currentStep = 3;
  if (isNer) currentStep = 4;

  const progressLabel = progressSteps[currentStep].label;
  const progressPercentage = progressSteps[currentStep].percentage;
  const headerText = progressSteps[currentStep].header;

  const categories = Object.keys(clsfLines);

  const categoriesNer =
    isNer &&
    nerResults &&
    nerResults.results &&
    nerResults.results[currentFileId.fileId]
      ? nerResults.results[currentFileId.fileId]
      : {};

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

          <Container
            fluid="md"
            className={`mt-4 detection-layout ${
              isCompleted ? "w-50" : ""
            }`}
          >
                        {isCompleted && (
              <>
                <Alert
                  variant="success"
                  dismissible
                  className="fixed-top-alert alert-slide mt-3"
                >
                  Files are uploaded successfully. You can continue or upload
                  more files.
                </Alert>
                <Container
                  className="d-flex justify-content-center match-container-1 mt-4"
                
                >
                  <h3>Processed File Summary</h3>
                </Container>
              </>
            )}
            <Row className="justify-content-center match-container-1 mt-2 mb-4" style={{marginLeft:"0.1rem", marginRight:"0.1rem"}}>
              
              {!isCompleted && (
                <Col md={6} className="highlight-section scrollable-column">
                  <div className="sticky-title text-center">
                    <h3 className="fs-6 mb-1 text-dark">
                      <b>{headerText}</b>
                    </h3>
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
                          !isDetected ||
                          selectedBatchIds.includes(batch.batchId)
                      )
                      .map((batch) => {
                        const allFilesCompleted = batch.files.every(
                          (file) => file.conversion_status === "completed"
                        );

                        return (
                          <Card
                            key={batch.batchId}
                            onClick={() =>
                              allFilesCompleted &&
                              !isDetected &&
                              handleBatchClick(batch.batchId)
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
                                <span className="info-text">
                                  {batch.batchId}
                                </span>
                              </div>
                              <br />
                              {isDetected ? (
                                <>
                                  <Badge
                                    className="me-2"
                                    bg={
                                      batch.detection_status === "completed"
                                        ? "success"
                                        : "secondary"
                                    }
                                    title={`Detection: ${
                                      batch.detection_status === "completed"
                                        ? "Completed"
                                        : "Pending"
                                    }`}
                                  >
                                    Detection{" "}
                                    {batch.detection_status === "completed" ? (
                                      <CheckCircleFill className="ms-1" />
                                    ) : (
                                      <HourglassSplit className="ms-1" />
                                    )}
                                  </Badge>
                                  <Badge
                                    className="me-2"
                                    bg={
                                      batch.ocr_status === "completed"
                                        ? "success"
                                        : "secondary"
                                    }
                                    title={`OCR: ${
                                      batch.ocr_status === "completed"
                                        ? "Completed"
                                        : "Pending"
                                    }`}
                                  >
                                    OCR{" "}
                                    {batch.ocr_status === "completed" ? (
                                      <CheckCircleFill className="ms-1" />
                                    ) : (
                                      <HourglassSplit className="ms-1" />
                                    )}
                                  </Badge>
                                  <Badge
                                    className="me-2"
                                    bg={
                                      batch.classification_status ===
                                      "completed"
                                        ? "success"
                                        : "secondary"
                                    }
                                    title={`Classification: ${
                                      batch.classification_status ===
                                      "completed"
                                        ? "Completed"
                                        : "Pending"
                                    }`}
                                  >
                                    Classification{" "}
                                    {batch.classification_status ===
                                    "completed" ? (
                                      <CheckCircleFill className="ms-1" />
                                    ) : (
                                      <HourglassSplit className="ms-1" />
                                    )}
                                  </Badge>
                                  <Badge
                                    className="me-2"
                                    bg={
                                      batch.ner_status === "completed"
                                        ? "success"
                                        : "secondary"
                                    }
                                    title={`NER: ${
                                      batch.ner_status === "completed"
                                        ? "Completed"
                                        : "Pending"
                                    }`}
                                  >
                                    NER{" "}
                                    {batch.ner_status === "completed" ? (
                                      <CheckCircleFill className="ms-1" />
                                    ) : (
                                      <HourglassSplit className="ms-1" />
                                    )}
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <div className="info-header">
                                    {allFilesCompleted
                                      ? "Uploading Status"
                                      : "Uploading..."}
                                    {!allFilesCompleted && (
                                      <HourglassSplit className="ms-2" />
                                    )}
                                  </div>
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
                        );
                      })}
                  </div>
                </Col>
              )}
              <Col
                md={isCompleted ? 12 : 6}
                className="detail-section scrollable-column"
              >
                {selectedBatchIds
                  .map((batchId) =>
                    batches.find((batch) => batch.batchId === batchId)
                  )
                  .map((selectedBatch, idx) => (
                    <div key={idx}>
                      <div className="sticky-title text-center">
                        <h4 className="fs-6 mb-2 mt-2 text-dark">
                          <b>Batch {selectedBatch.batchId}</b>
                          <br />
                          <b>
                            Uploaded on {formatDate(selectedBatch.start_date)}
                          </b>
                        </h4>
                      </div>
                      {selectedBatch.files.map((file, index) => (
                        <Card key={index} className="mt-2">
                          <Card.Body>
                            <div className="mb-1" style={{ fontSize: "15px" }}>
                              <b>File ID:</b>
                              <span className="info-text"> {file.file_id}</span>
                            </div>
                            <div className="mb-1" style={{ fontSize: "15px" }}>
                              <b>Process Type:</b>
                              <span className="info-text">
                                {" "}
                                {file.process_type}
                              </span>
                            </div>
                            <div className="mb-1" style={{ fontSize: "15px" }}>
                              <b>Upload Status:</b>
                              <span className="info-text">
                                {" "}
                                {file.conversion_status}
                              </span>
                            </div>
                            <div className="mb-1" style={{ fontSize: "15px" }}>
                              <b>Number of Pages:</b>
                              <span className="info-text">
                                {" "}
                                {file.number_of_pages}
                              </span>
                            </div>
                            <div className="mb-1" style={{ fontSize: "15px" }}>
                              <b> File Name:</b>
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
                                {isCompleted ? "All Results" : "Results"}
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ))}
                {selectedBatchIds.length === 0 && (
                  <div className="text-center mt-3"></div>
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
              style={{ width: `${isNer ? "180px" : "150px"}` }}
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
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "20px",
                }}
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
                        {isCompleted
                          ? "NLP Results"
                          : isNer
                          ? "Named Entity Recognition Results"
                          : isClassification
                          ? "Classification Results"
                          : "OCR Results"}
                      </h5>
                    </div>
                    {isCompleted ? (
                      <Accordion defaultActiveKey="">
                        <Accordion.Item eventKey="classification">
                          <Accordion.Header>
                            Classification Results
                          </Accordion.Header>
                          <Accordion.Body>
                            {Object.entries(clsfLines).map(
                              ([category, items]) => (
                                <div key={category} className="mb-4">
                                  <h5
                                    className=""
                                    style={{ color: "rgb(148, 44, 210)" }}
                                  >
                                    {category.toUpperCase()}{" "}
                                    <Badge
                                      bg=""
                                      style={{ backgroundColor: "#cc71c4" }}
                                    >
                                      {items.length}
                                    </Badge>
                                  </h5>
                                  {items.map((item, subIndex) => (
                                    <div
                                      key={subIndex}
                                      className="p-3 mb-2 border rounded"
                                    >
                                      <p className="mb-1 font-monospace">
                                        {item.text}
                                      </p>
                                      <small className="text-muted fs-6">
                                        <Badge
                                          bg=""
                                          style={{
                                            backgroundColor: "#9879b0",
                                            color: "white",
                                          }}
                                        >
                                          Score: {item.score.toFixed(3)}
                                        </Badge>
                                      </small>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="ner">
                          <Accordion.Header>
                            Named Entity Recognition (NER) Results
                          </Accordion.Header>
                          <Accordion.Body>
                            {Object.entries(
                              nerResults.results[currentFileId.fileId] || {}
                            ).map(([category, items]) => (
                              <div key={category} className="mb-4">
                                <h5
                                  className=""
                                  style={{ color: "rgb(148, 44, 210)" }}
                                >
                                  {category.toUpperCase()}{" "}
                                  <Badge
                                    bg=""
                                    style={{ backgroundColor: "#cc71c4" }}
                                  >
                                    {items.length}
                                  </Badge>
                                </h5>
                                {items.map((item, subIndex) => (
                                  <div
                                    key={subIndex}
                                    className="p-3 mb-2 border rounded"
                                  >
                                    <p className="mb-1 font-monospace">
                                      {item.text}{" "}
                                      <Badge
                                        bg=""
                                        style={{
                                          backgroundColor: "rgb(148, 44, 210)",
                                        }}
                                      >
                                        {item.label}
                                      </Badge>
                                    </p>
                                    <small className="text-muted fs-6">
                                      <Badge
                                        bg=""
                                        style={{
                                          backgroundColor: "#9879b0",
                                          color: "white",
                                        }}
                                      >
                                        Score: {item.score.toFixed(3)}
                                      </Badge>
                                    </small>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    ) : isNer ? (
                      <Accordion className="mb-3 font-monospace">
                        {Object.entries(categoriesNer).map(
                          ([category, items], idx) => (
                            <Accordion.Item eventKey={`${idx}`} key={category}>
                              <Accordion.Header>
                                <th>{category.toUpperCase()} </th>
                                <Badge
                                  bg=""
                                  style={{
                                    backgroundColor: "#cc71c4",
                                    marginLeft: "5px",
                                  }}
                                >
                                  {items.length}
                                </Badge>
                              </Accordion.Header>
                              <Accordion.Body>
                                {items.map((item, subIndex) => (
                                  <Form.Group
                                    className="mb-3"
                                    key={`${item.start}-${item.end}-${item.text}`}
                                  >
                                    <Form.Label className="fw-bold">
                                      Text (Current Label:{" "}
                                      <Badge
                                        bg=""
                                        style={{
                                          backgroundColor: "rgba(130, 38, 158)",
                                        }}
                                      >
                                        {item.label}
                                      </Badge>
                                      )
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
                                        size="sm"
                                        variant="secondary"
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
                                        size="sm"
                                        onClick={() =>
                                          handleNerDelete(
                                            currentFileId.fileId,
                                            category,
                                            item
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
                            <Accordion.Header className="font-monospace">
                              <th>
                                {" "}
                                {category.toUpperCase()} (
                                {clsfLines[category].length})
                              </th>
                            </Accordion.Header>
                            <Accordion.Body>
                              <Table
                                striped
                                bordered
                                hover
                                size="md"
                                className="font-monospace border border-dark"
                              >
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
                                          <div
                                            className="d-flex align-items-center justify-content-center"
                                            style={{ width: "100%" }}
                                          >
                                            {" "}
                                            {/* Updated to center content */}
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
                                                handleDelete(
                                                  category,
                                                  subIndex
                                                );
                                              }}
                                            >
                                              <Trash />
                                            </Button>
                                          </div>
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
                      <Accordion defaultActiveKey="" onSelect={handleSelect}>
                        {ocrLines.map((text, index) => (
                          <Accordion.Item
                            key={`${currentFileId.fileId}-${index}`}
                            eventKey={`${index}`}
                          >
                            <Accordion.Header>
                              <div className="d-flex justify-content-between font-monospace align-items-center w-100">
                                <th>
                                  <span>{truncateText(text)}</span>
                                </th>
                                {activeKey == `${index}` && ( // Conditionally render the button
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent accordion toggle
                                      handleDeleteLine(index);
                                    }}
                                    className="button-delete ms-auto"
                                    style={{
                                      backgroundColor: "white",
                                      border: "none",
                                      color: "black",
                                    }}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </Accordion.Header>
                            <Accordion.Body className="font-monospace">
                              {text}
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    )}
                    {!isCompleted && (
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
                    )}
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
