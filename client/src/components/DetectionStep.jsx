import { useState, useEffect } from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import PropTypes from "prop-types";
import {
  ArrowRightCircle,
  CheckCircleFill,
  ArrowLeftCircle,
} from "react-bootstrap-icons";
import axios from "axios";
function DetectionStep({ onStepChange }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

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
            completed: files.filter((file) => file.status === "completed")
              .length,
            pending: files.filter((file) => file.status === "pending").length,
            failed: files.filter((file) => file.status === "failed").length,
          };
        }
      );

      setBatches(formattedBatches);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
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

  const selectedBatch = batches.find(
    (batch) => batch.batchId === selectedBatchId
  );

  const containerStyle = (batchId) => ({
    backgroundColor: selectedBatchId === batchId ? "#e1d2ec" : "#f8f9fa",
    cursor: "pointer",
    position:"relative"
  });

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
          <Col md={6} className="highlight-section scrollable-column">
            {batches.map((batch) => (
              <Card
                key={batch.batchId}
                onClick={() => handleBatchClick(batch.batchId)}
                style={containerStyle(batch.batchId)}
                className="mt-3"
              >
                <Card.Body>
                  <Card.Title style={{ fontSize: "13px" }}>
                    Date: {batch.start_date}
                  </Card.Title>
                  <Card.Title style={{ fontSize: "13px" }}>
                    Batch ID: {batch.batchId}
                  </Card.Title>
                  <Card.Text style={{ fontSize: "13px" }}>
                    Completed: {batch.completed}
                  </Card.Text>
                  <Card.Text style={{ fontSize: "13px" }}>
                    Pending: {batch.pending}
                  </Card.Text>
                  <Card.Text style={{ fontSize: "13px" }}>
                    Failed: {batch.failed}
                  </Card.Text>
                  {selectedBatchId === batch.batchId && (
                    <CheckCircleFill
                      color="purple"
                      size={20}
                      style={{ position: "absolute", top: "5px", right: "5px" }}
                    />
                  )}
                </Card.Body>
              </Card>
            ))}
          </Col>
          <Col md={6} className="detail-section scrollable-column">
            {selectedBatch ? (
              <>
                <h5>Files in Batch {selectedBatch.batchId}</h5>
                {selectedBatch.files.map((file, index) => (
                  <Card key={index} className="mt-3">
                    <Card.Body>
                      <Card.Title style={{ fontSize: "13px" }}>
                        File ID: {file.file_id}
                      </Card.Title>
                      <Card.Text style={{ fontSize: "13px" }}>
                        Process Type: {file.process_type}
                      </Card.Text>
                      <Card.Text style={{ fontSize: "13px" }}>
                        Status: {file.status}
                      </Card.Text>
                      <Card.Text style={{ fontSize: "13px" }}>
                        Number of Pages: {file.number_of_pages}
                      </Card.Text>
                      <Card.Text style={{ fontSize: "13px" }}>
                        Save Path: {file.save_path}
                      </Card.Text>
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
    </>
  );
}

DetectionStep.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default DetectionStep;
