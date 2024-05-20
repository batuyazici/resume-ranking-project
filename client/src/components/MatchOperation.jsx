import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Accordion,
  Table,
  Collapse,
  ListGroup,
  Badge,
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
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";

const extensions = [
  Heading,
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  BulletList,
  ListItem,
  HardBreak,
];

const MatchOperation = () => {
  const [matchResult, setMatchResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showResultButton, setShowResultButton] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [jobDescriptions, setJobDescriptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [open, setOpen] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_FAST_API_MATCH_DATA);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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

  const toggleFile = (fileId) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [fileId]: !prevOpen[fileId],
    }));
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
    setButtonLoading(true);

    try {
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

      const sortedMatches = result.matches.sort(
        (a, b) => b.final_score - a.final_score
      );

      setMatchResult(result);
      setMatches(sortedMatches);
      setShowResultButton(true);
    } catch (error) {
      console.error("Error matching data:", error);
    } finally {
      setButtonLoading(false);
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

  const containerStyle = (containerId, isResume = false) => ({
    backgroundColor: selectedContainers.includes(containerId) ? "#e1d2ec" : "",
    cursor: isResume ? "default" : "pointer",
    position: "relative",
    border: "1px solid #d3d3d3",
    borderRadius: "8px",
    marginBottom: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    pointerEvents: isResume ? "none" : "auto",
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
      setSelectedContainers((prev) => {
        if (!prev.includes(`batch-${batchId}`)) {
          return [...prev, `batch-${batchId}`];
        }
        return prev;
      });
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

  const getButtonText = (jobId) => {
    return jobDescriptions[jobId] ? "Hide Details" : "Job Details";
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
                          <b>Date: </b> {formatDate(batch.start_date)}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          <b> Batch ID: </b> {batch.batch_id}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          <b> Uploaded Resumes </b>
                          <Badge
                            bg=""
                            style={{
                              backgroundColor: "rgb(148, 44, 210)",
                            }}
                          >
                            {batch.resumes.length}
                          </Badge>
                        </Card.Title>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandBatch(batch.batch_id);
                          }}
                        >
                          <b>
                            {expandedBatch === batch.batch_id
                              ? "Hide Resumes"
                              : "View Resumes"}{" "}
                          </b>
                        </Button>
                        {expandedBatch === batch.batch_id && (
                          <div>
                            {batch.resumes.map((resume) => (
                              <Card
                                className="mt-3"
                                key={`resume-${resume.file_id}`}
                                style={containerStyle(
                                  `resume-${resume.file_id}`,
                                  true
                                )}
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
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        )}
                        {checkMark(`batch-${batch.batch_id}`)}
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
                          <b>Date:</b> {formatDate(job.create_date)}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          <b>Job ID:</b> {job.job_id}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          <b>Job Title:</b> {job.job_title}
                        </Card.Title>
                        <Card.Title style={{ fontSize: "14px" }}>
                          <b>Company:</b> {job.company_name}
                        </Card.Title>
                        <div className="d-flex justify-content-between align-items-center">
                          {checkMark(`job-${job.job_id}`)}
                        </div>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="mb-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(job.job_id);
                          }}
                        >
                          <b>{getButtonText(job.job_id)}</b>
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
              className="mt-1 mb-5 btn-sm"
              size="lg"
              onClick={handleMatchThemClick}
              disabled={buttonLoading}
            >
              {buttonLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="sr-only"> Loading...</span>
                </>
              ) : (
                <>
                  <b>Match Them</b> <ArrowRightCircle size={25} />
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="form-continue-section d-flex justify-content-center">
          <div style={{ width: "100%", maxWidth: "800px" }}>
            <Container>
              <Row className=" mb-3">
              <Col>
                <Button
                  variant="outline-dark"
                  className="mb-2"
                  size="sm"
                  onClick={() => setShowResultButton(false)}
                >
                  <b>Return</b>
                </Button>
                </Col>
                <Col className="col align-self-center"><h3 style={{ color: "#000" }}>Match Results</h3> </Col>
              </Row>
              <Row className="justify-content-center mb-4">
                <Accordion defaultActiveKey="0" style={{ width: "100%" }}>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <div
                        className="d-flex w-100 justify-content-between align-items-center"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <div className="flex-fill text-center">
                          <strong>Job ID:</strong> {matchResult.job_id}
                        </div>
                        <div className="flex-fill text-center">
                          <strong>Title:</strong> {matchResult.job_title}
                        </div>
                        <div className="flex-fill text-center">
                          <strong>Company:</strong> {matchResult.company}
                        </div>
                        <div className="flex-fill text-center">
                          <strong>Date:</strong>{" "}
                          {formatDate(matchResult.match_date)}
                        </div>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      {matchResult.matches.map((match, fileIndex) => (
                        <div key={fileIndex}>
                          <Card>
                            <Card.Header
                              onClick={() => toggleFile(match.file_id)}
                              aria-controls={`file-details-${match.file_id}`}
                              aria-expanded={open[match.file_id]}
                              style={{
                                cursor: "pointer",
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <div className="d-flex justify-content-between">
                                <div>
                                  <strong>File ID:</strong> {match.file_id}
                                </div>
                                <div>{match.original_name}</div>
                                <div>
                                  <strong>Final Score:</strong>{" "}
                                  {match.final_score}
                                </div>
                              </div>
                            </Card.Header>
                            <Collapse in={open[match.file_id]}>
                              <div id={`file-details-${match.file_id}`}>
                                <Card.Body>
                                  <h5>Scores</h5>
                                  <Table bordered hover className="mb-3">
                                    <thead
                                      style={{
                                        backgroundColor: "rgb(148, 44, 210)",
                                        color: "white",
                                      }}
                                    >
                                      <tr>
                                        <th>Category</th>
                                        <th>Score</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>Skills</td>
                                        <td>
                                          {match.similarity_scores.skills}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Experience</td>
                                        <td>
                                          {match.similarity_scores.experience}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Education</td>
                                        <td>
                                          {match.similarity_scores.education}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Miscellaneous</td>
                                        <td>
                                          {
                                            match.similarity_scores
                                              .miscellaneous
                                          }
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>BM25</td>
                                        <td>
                                          {Object.values(
                                            match.bm25_scores
                                          ).reduce((a, b) => a + b, 0)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </Table>
                                  <h5>BM25 Scores Detail</h5>
                                  <ListGroup variant="flush" className="mb-3">
                                    {Object.entries(match.bm25_scores).length >
                                    0 ? (
                                      Object.entries(match.bm25_scores).map(
                                        ([key, value]) => (
                                          <ListGroup.Item
                                            key={key}
                                            style={{
                                              color:
                                                value > 0 ? "green" : "inherit",
                                            }}
                                          >
                                            <strong>{key}:</strong> {value}{" "}
                                            (BM25 Score)
                                          </ListGroup.Item>
                                        )
                                      )
                                    ) : (
                                      <ListGroup.Item>
                                        No BM25 scores available
                                      </ListGroup.Item>
                                    )}
                                  </ListGroup>
                                  <h5>Extracted Information</h5>
                                  <ListGroup variant="flush">
                                    {Object.entries(match.extracted_info)
                                      .length > 0 ? (
                                      Object.entries(match.extracted_info).map(
                                        ([key, value]) => (
                                          <ListGroup.Item key={key}>
                                            <strong>{key}:</strong>{" "}
                                            {value.join(", ")}
                                          </ListGroup.Item>
                                        )
                                      )
                                    ) : (
                                      <ListGroup.Item>
                                        No extracted information available
                                      </ListGroup.Item>
                                    )}
                                  </ListGroup>
                                </Card.Body>
                              </div>
                            </Collapse>
                          </Card>
                        </div>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Row>
            </Container>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MatchOperation;
