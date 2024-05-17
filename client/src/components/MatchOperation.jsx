import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Accordion,
} from "react-bootstrap";
import { ArrowRightCircle, CheckCircleFill } from "react-bootstrap-icons";
import { generateHTML } from "@tiptap/html";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";

const extensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  BulletList,
  ListItem,
];

const MatchOperation = () => {
  const [showResultButton, setShowResultButton] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [jobDescriptions, setJobDescriptions] = useState({});
  const [matchResult, setMatchResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(import.meta.env.VITE_FAST_API_MATCH_DATA);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        const groupedBatches = data.batches.reduce((acc, item) => {
          const { batch_id, start_date } = item;
          if (!acc[batch_id]) {
            acc[batch_id] = {
              batch_id,
              start_date,
              resumes: [],
            };
          }
          acc[batch_id].resumes.push({
            file_id: item.file_id,
            storage_name: item.storage_name,
            original_name: item.original_name,
            process_type: item.process_type,
            upload_date: item.start_date,
          });
          return acc;
        }, {});

        setBatches(Object.values(groupedBatches));
        setJobs(data.jobs);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

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

  const handleMatchThemClick = async () => {
    const selectedBatchIds = selectedContainers
      .filter((id) => id.includes("batch"))
      .map((id) => id.replace("batch-", ""));
    const selectedJobId = selectedContainers.find((id) => id.includes("job"));

    if (!selectedJobId || selectedBatchIds.length === 0) {
      alert("Please select at least one batch and one job.");
      return;
    }

    const jobId = selectedJobId.replace("job-", "");

    try {
      console.log(selectedBatchIds, jobId);
      const response = await fetch(`${import.meta.env.VITE_FAST_API_MATCH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch_ids: selectedBatchIds,
          job_id: jobId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);

      const sortedMatches = result.matches.sort(
        (a, b) => b.final_score - a.final_score
      );

      setMatchResult(result);
      setMatches(sortedMatches);
      setShowResultButton(true);
    } catch (error) {
      console.error("Error matching data:", error);
    }
  };

  const handleContainerClick = (containerId) => {
    setSelectedContainers((prev) => {
      const containerType = containerId.includes("batch") ? "batch" : "job";

      if (containerType === "job") {
        if (prev.includes(containerId)) {
          return prev.filter((id) => !id.includes("job"));
        } else {
          const nonJobContainers = prev.filter((id) => !id.includes("job"));
          return [...nonJobContainers, containerId];
        }
      } else {
        const filteredContainers = prev.filter(
          (id) => !id.includes(containerId)
        );
        if (prev.includes(containerId)) {
          return filteredContainers;
        } else {
          return [...filteredContainers, containerId];
        }
      }
    });
  };

  const containerStyle = (containerId) => ({
    backgroundColor: selectedContainers.includes(containerId) ? "#e1d2ec" : "",
    cursor: "pointer",
    position: "relative",
    border: "1px solid #d3d3d3",
    borderRadius: "8px",
    marginBottom: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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

  const handleExpandBatch = (batchId) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
    } else {
      setExpandedBatch(batchId);
    }
  };

  const renderJobDescription = (jobDescJSON) => {
    const html = generateHTML(jobDescJSON, extensions);
    return (
      <div
        style={{
          fontFamily: "inherit",
          fontWeight: "normal",
          fontSize: "inherit",
          padding: "10px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  };

  const handleViewJob = async (jobId) => {
    setJobDescriptions((prev) => {
      const newDescriptions = { ...prev };
      if (newDescriptions[jobId]) {
        delete newDescriptions[jobId];
      } else {
        newDescriptions[jobId] = null;
        fetch(`${import.meta.env.VITE_FAST_API_JOB_DESC}/${jobId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((jobDescription) => {
            setJobDescriptions((prev) => ({
              ...prev,
              [jobId]: jobDescription,
            }));
          })
          .catch((error) => {
            console.error("Error fetching job description:", error);
          });
      }
      return newDescriptions;
    });
  };

  return (
    <Container fluid="md" className="mt-4">
      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      ) : !showResultButton ? (
        <>
          <Row className="justify-content-center match-container-1 mt-4 mb-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title
                    className="text-center"
                    style={{ fontSize: "18px", fontWeight: "bold" }}
                  >
                    Uploaded Batches
                  </Card.Title>
                  {batches.map((batch) => (
                    <Card
                      className="mt-3"
                      key={`batch-${batch.batch_id}`}
                      style={containerStyle(`batch-${batch.batch_id}`)}
                      onClick={() =>
                        handleContainerClick(`batch-${batch.batch_id}`)
                      }
                    >
                      <Card.Body>
                        <Card.Title style={{ fontSize: "14px" }}>
                          Date: {formatDate(batch.start_date)}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          Batch ID: {batch.batch_id}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          Uploaded Resumes:{" "}
                          <Badge bg="info">{batch.resumes.length}</Badge>
                        </Card.Title>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandBatch(batch.batch_id);
                          }}
                        >
                          {expandedBatch === batch.batch_id
                            ? "Hide Resumes"
                            : "View Resumes"}
                        </Button>
                        {expandedBatch === batch.batch_id && (
                          <div>
                            {batch.resumes.map((resume) => (
                              <Card
                                className="mt-3"
                                key={`resume-${resume.file_id}`}
                                style={containerStyle(
                                  `resume-${resume.file_id}`
                                )}
                                onClick={() =>
                                  handleContainerClick(
                                    `resume-${resume.file_id}`
                                  )
                                }
                              >
                                <Card.Body>
                                  <Card.Title style={{ fontSize: "14px" }}>
                                    File ID: {resume.file_id}
                                  </Card.Title>
                                  <Card.Title style={{ fontSize: "14px" }}>
                                    Date: {formatDate(resume.upload_date)}
                                  </Card.Title>
                                  <Card.Title style={{ fontSize: "14px" }}>
                                    File Name: {resume.original_name}
                                  </Card.Title>
                                  <Card.Title style={{ fontSize: "14px" }}>
                                    Process Type: {resume.process_type}
                                  </Card.Title>
                                  <div className="d-flex justify-content-between align-items-center">
                                    {checkMark(`resume-${resume.file_id}`)}
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title
                    className="text-center"
                    style={{ fontSize: "18px", fontWeight: "bold" }}
                  >
                    Jobs
                  </Card.Title>
                  {jobs.map((job) => (
                    <Card
                      className="mt-3"
                      key={`job-${job.job_id}`}
                      style={containerStyle(`job-${job.job_id}`)}
                      onClick={() => handleContainerClick(`job-${job.job_id}`)}
                    >
                      <Card.Body>
                        <Card.Title style={{ fontSize: "14px" }}>
                          Date: {formatDate(job.create_date)}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          Job ID: {job.job_id}
                        </Card.Title>
                        <div className="d-flex justify-content-between align-items-center">
                          {checkMark(`job-${job.job_id}`)}
                        </div>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(job.job_id);
                          }}
                        >
                          View Job
                        </Button>
                        {jobDescriptions[job.job_id] && (
                          <div>
                            {renderJobDescription(jobDescriptions[job.job_id])}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="form-continue-section d-flex justify-content-center">
            <Button
              variant="outline-dark"
              className="mt-1 mb-5 btn-lg"
              size="lg"
              onClick={handleMatchThemClick}
            >
              Match Them <ArrowRightCircle size={25} />
            </Button>
          </div>
        </>
      ) : (
        <div className="form-continue-section d-flex justify-content-center">
          <div style={{ width: "100%", maxWidth: "800px" }}>
            <h3>Match Results:</h3>
            <Accordion defaultActiveKey="0">
              {matches.map((match, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    <span className="me-2">File ID: {match.file_id}</span>
                      <span className="ms-auto">Final Score: {match.final_score}</span>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="d-flex justify-content-between flex-wrap">
                      <Badge bg="success" className="mb-2">
                        Skills Score: {match.similarity_scores.skills}
                      </Badge>
                      <Badge bg="warning" className="mb-2">
                        Experience Score: {match.similarity_scores.experience}
                      </Badge>
                      <Badge bg="info" className="mb-2">
                        Education Score: {match.similarity_scores.education}
                      </Badge>
                      <Badge bg="secondary" className="mb-2">
                        Miscellaneous Score:{" "}
                        {match.similarity_scores.miscellaneous}
                      </Badge>
                    </div>
                    {Object.keys(match.bm25_scores).length > 0 && (
                      <Card.Text className="mt-3">
                        <strong>BM25 Scores:</strong>
                        <ul>
                          {Object.entries(match.bm25_scores).map(
                            ([key, value]) => (
                              <li
                                key={key}
                                style={{
                                  color: value > 0 ? "green" : "inherit",
                                }}
                              >
                                {key}: {value}
                              </li>
                            )
                          )}
                        </ul>
                      </Card.Text>
                    )}

                    <Card.Text className="mt-3">
                      <strong>Extracted Info:</strong>
                      <ul>
                        {Object.entries(match.extracted_info).map(
                          ([key, value]) => (
                            <li key={key}>
                              {key}: {value.join(", ")}
                            </li>
                          )
                        )}
                      </ul>
                    </Card.Text>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MatchOperation;
