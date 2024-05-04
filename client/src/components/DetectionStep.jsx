import React, { useState } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Form,
  FormGroup,
  FormControl,
  FormCheck,
} from "react-bootstrap";
import PropTypes from "prop-types";
import {
  ArrowRightCircle,
  CheckCircleFill,
  ArrowLeftCircle,
} from "react-bootstrap-icons";

function DetectionStep({ onStepChange }) {
  const [selectedContainers, setSelectedContainers] = useState([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState("");
  const [iouThreshold, setIouThreshold] = useState("");
  const [labelThickness, setLabelThickness] = useState("");
  const [showLabels, setShowLabels] = useState(true); // Default to true
  const [processedDetailsVisible, setProcessedDetailsVisible] = useState({});

  const handleDetectClick = () => {
    console.log("Detection Started for Containers:", selectedContainers);
    // Add logic here for what happens when detection is triggered
  };

  const handleContainerClick = (containerId) => {
    setSelectedContainers((prev) => {
      const containerType = containerId.includes("resume") ? "resume" : "job";
      return prev.includes(containerId)
        ? prev.filter((id) => id !== containerId)
        : [...prev, containerId];
    });
  };

  const toggleDetailsVisibility = (index) => {
    setProcessedDetailsVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const containerStyle = (containerId) => ({
    backgroundColor: selectedContainers.includes(containerId)
      ? "#e1d2ec"
      : "#f8f9fa",
    cursor: "pointer",
    position: "relative",
  });

  const checkMark = (containerId) => {
    return selectedContainers.includes(containerId) ? (
      <CheckCircleFill
        color="purple"
        size={20}
        style={{ position: "absolute", top: "5px", right: "5px" }}
      />
    ) : null;
  };

  const isDetectEnabled =
    confidenceThreshold &&
    iouThreshold &&
    labelThickness &&
    selectedContainers.length > 0;

  return (
    <>
    <style type="text/css">
        {`
          .form-control:focus, .form-select:focus {
            box-shadow: 0 0 0 0.25rem rgba(130, 38, 158, 0.5); /* Purple shadow */
            border: rgba(130, 38, 158, 0.5);
          }
        `}
      </style>
      <Container fluid="md" className="mt-4">
        <Row className="justify-content-center match-container-1 mt-2 mb-4">
          <Col md={3}>
            <Card>
              <Card.Body>
                <Card.Title
                  className="text-center"
                  style={{ fontSize: "16px" }}
                >
                  Object Detection Model Details
                </Card.Title>
                <Form>
                  <FormGroup className="mb-2">
                    <Form.Label style={{ fontSize: "12px" }}>Model</Form.Label>
                    <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                      YOLOv9
                    </div>
                  </FormGroup>
                  <FormGroup className="mb-2">
                    <Form.Label style={{ fontSize: "12px" }}>
                      Confidence Threshold
                    </Form.Label>
                    <FormControl
                      type="number"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(e.target.value)}
                      style={{ fontSize: "12px" }}
                    />
                  </FormGroup>
                  <FormGroup className="mb-2">
                    <Form.Label style={{ fontSize: "12px" }}>
                      IOU Threshold
                    </Form.Label>
                    <FormControl
                      type="number"
                      value={iouThreshold}
                      onChange={(e) => setIouThreshold(e.target.value)}
                      style={{ fontSize: "12px" }}
                    />
                  </FormGroup>
                  <FormGroup className="mb-2">
                    <Form.Label style={{ fontSize: "12px" }}>
                      Label Thickness
                    </Form.Label>
                    <FormControl
                      type="number"
                      value={labelThickness}
                      onChange={(e) => setLabelThickness(e.target.value)}
                      style={{ fontSize: "12px" }}
                    />
                  </FormGroup>
                  <FormGroup className="mb-2">
                    <Form.Check
                      type="checkbox"
                      label="Show Labels"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                      style={{ fontSize: "12px" }}
                    />
                  </FormGroup>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={9}>
            <Card>
              <Card.Body>
                <Card.Title
                  className="text-center"
                  style={{ fontSize: "16px", paddingBottom: "15px" }}
                >
                  Uploaded Resumes
                </Card.Title>
                <Row>
                  <Col md={6} className="highlight-section scrollable-column">
                    <div style={{ fontSize: "16px" }}>Not Processed</div>
                    {[...Array(7)].map((_, index) => (
                      <Card
                        className="mt-3"
                        key={`resume-${index}`}
                        style={containerStyle(`resume-${index}`)}
                        onClick={() => handleContainerClick(`resume-${index}`)}
                      >
                        <Card.Body>
                          <Card.Title style={{ fontSize: "13px" }}>
                            Date: {index + 1}
                          </Card.Title>
                          <Card.Title style={{ fontSize: "13px" }}>
                            Uploaded Resumes: {index + 1}
                          </Card.Title>
                          <div className="d-flex justify-content-between align-items-center">
                            {checkMark(`resume-${index}`)}
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </Col>
                  <Col md={6} className="scrollable-column">
                    <div style={{ fontSize: "16px" }}>Processed</div>
                    {[...Array(5)].map((_, index) => (
                      <Card
                        className="mt-3"
                        key={`processed-${index}`}
                        onClick={() => toggleDetailsVisibility(index)}
                      >
                        <Card.Body>
                          <Card.Title style={{ fontSize: "13px" }}>
                            Date: {new Date().toISOString().split("T")[0]}
                          </Card.Title>
                          <Card.Title style={{ fontSize: "13px" }}>
                            Processed Resume {index + 1}
                          </Card.Title>
                          {processedDetailsVisible[index] ? (
                            <div>
                              <p>Details of processing...</p>
                            </div>
                          ) : (
                            <Button
                            variant="secondary"
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.75rem",
                              backgroundColor: "#942cd2", 
                              color: "white", 
                              border:"#942cd2"
                            }}
                          >
                            Show Details
                          </Button>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="form-continue-section d-flex justify-content-center">
          <Button
            variant="outline-dark"
            className="mt-1 mb-5 btn-sm mx-3"
            size="lg"
            style={{ width: "150px" }}
            onClick={onStepChange}
          >
            Return <ArrowLeftCircle size={25} />
          </Button>
          <Button
            variant="outline-dark"
            disabled={!isDetectEnabled}
            className="mt-1 mb-5 btn-sm mx-3"
            size="lg"
            style={{ width: "150px" }}
            onClick={handleDetectClick}
          >
            {isDetectEnabled ? "Detect" : "Enter Details"}{" "}
            <ArrowRightCircle size={25} />
          </Button>
        </div>
      </Container>
    </>
  );
}

DetectionStep.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default DetectionStep;
