import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Card,
  Accordion,
  Table,
  Collapse,
  ListGroup,
  Spinner,
} from "react-bootstrap";

function MatchResults() {
  const [open, setOpen] = useState({});
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchResults = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_FAST_API_RESULTM);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMatchResults(data);
      } catch (error) {
        console.error("Error fetching match results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchResults();
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }
    if (matchResults.length === 0) {
      return (
        <Container
          fluid="md"
          className="d-flex justify-content-center match-container-1 mt-4 w-50"
        >
            <h3 className="">There is no matched resumes or jobs</h3>
        </Container>
      );
  }
  
  return (
    <div className="form-continue-section d-flex justify-content-center">
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <Container>
          <Row className="justify-content-center mt-3 mb-3">
            <div
              className="text-white py-2 align-items-center"
              style={{
                border: "1px solid #942cd2",
                backgroundColor: "#942cd2",
                borderRadius: "5px",
              }}
            >
              <h3 style={{ margin: "0", textAlign: "center" }}>
                Match Results
              </h3>
            </div>
          </Row>
          <Row className="justify-content-center mb-4">
            <Accordion
              defaultActiveKey="0"
              style={{ width: "100%", padding: "0" }}
            >
              {matchResults.map((matchResult, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    <div
                      className="d-flex w-100 justify-content-between align-items-center flex-nowrap"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <div>
                        <strong>Match ID:</strong> {matchResult.match_id}
                      </div>
                      <div>
                        <strong>Job Title:</strong> {matchResult.job_title}
                      </div>
                      <div>
                        <strong>Company:</strong> {matchResult.company}
                      </div>
                      <div>
                        <strong>Match Date:</strong>{" "}
                        {formatDate(matchResult.match_date)}
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    {matchResult.matches
                      .slice() // Create a copy of the array
                      .sort((a, b) => b.final_score - a.final_score) // Sort in descending order based on final_score
                      .map((match, fileIndex) => (
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
                                        <th>Weight</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>Skills</td>
                                        <td>
                                          {match.similarity_scores.skills}
                                        </td>
                                        <td>{match.weights.skills}</td>
                                      </tr>
                                      <tr>
                                        <td>Experience</td>
                                        <td>
                                          {match.similarity_scores.experience}
                                        </td>
                                        <td>{match.weights.experience}</td>
                                      </tr>
                                      <tr>
                                        <td>Education</td>
                                        <td>
                                          {match.similarity_scores.education}
                                        </td>
                                        <td>{match.weights.education}</td>
                                      </tr>
                                      <tr>
                                        <td>Miscellaneous</td>
                                        <td>
                                          {
                                            match.similarity_scores
                                              .miscellaneous
                                          }
                                        </td>
                                        <td>{match.weights.miscellaneous}</td>
                                      </tr>
                                      <tr>
                                        <td>Keyword Match</td>
                                        <td>
                                          {Object.values(
                                            match.bm25_scores
                                          ).reduce((a, b) => a + b, 0)}
                                        </td>
                                        <td>{match.weights.bm25}</td>
                                      </tr>
                                    </tbody>
                                  </Table>
                                  <h5>Keyword Matches Detail</h5>
                                  <Table bordered hover>
                                    <thead
                                      style={{
                                        backgroundColor: "rgb(148, 44, 210)",
                                        color: "white",
                                      }}
                                    >
                                      <tr>
                                        <th>Keyword</th>
                                        <th>Score</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(match.bm25_scores)
                                        .length > 0 ? (
                                        Object.entries(match.bm25_scores).map(
                                          ([key, value]) => (
                                            <tr key={key}>
                                              <td>{key}</td>
                                              <td
                                                style={{
                                                  color:
                                                    value > 0
                                                      ? "green"
                                                      : "inherit",
                                                }}
                                              >
                                                {value}{" "}
                                                {value === 0 && "(No matches)"}
                                              </td>
                                            </tr>
                                          )
                                        )
                                      ) : (
                                        <tr>
                                          <td colSpan={2}>
                                            No BM25 scores available
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </Table>
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
              ))}
            </Accordion>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default MatchResults;
