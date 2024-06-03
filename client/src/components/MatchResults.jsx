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
  Button,
  Modal,
} from "react-bootstrap";
import { useEditor, EditorContent } from "@tiptap/react";
import { ArrowLeftCircleFill, ArrowRightCircleFill } from 'react-bootstrap-icons';
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";
import HardBreak from "@tiptap/extension-hard-break";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; 
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Document as PDFDocument, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function MatchResults() {
  const [open, setOpen] = useState({});
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobModalShow, setJobModalShow] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [pdfModalShow, setPdfModalShow] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      BulletList,
      ListItem,
      Heading,
      HardBreak,
    ],
    content: "",
  });

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

  useEffect(() => {
    if (editor && jobDetails) {
      editor.commands.setContent(jobDetails.JobDescJSON);
    }
  }, [jobDetails, editor]);

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

  const handleViewJob = async (jobId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FAST_API_MATCH}/job/${jobId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jobData = await response.json();
      setJobDetails(jobData);
      setJobModalShow(true);
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  };

  const handleViewPdf = async (fileId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FAST_API_MATCH}/pdf/${fileId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      setPdfFile(URL.createObjectURL(blob));
      setPdfModalShow(true);
    } catch (error) {
      console.error("Error fetching PDF file:", error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
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
      </div>
    );
  }

  if (matchResults.length === 0) {
    return (
      <Container
        fluid="md"
        className="d-flex justify-content-center match-container-1 mt-4 w-50"
      >
        <h3>There are no matched resumes or jobs</h3>
      </Container>
    );
  }

  return (
    <div className="form-continue-section d-flex justify-content-center">
      <div style={{ width: "100%", maxWidth: "1000px" }}>
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
                      <Button
                         variant="outline-dark"
                         size="sm"
                         style={{ backgroundColor: "white", color: "black", borderColor: "black" }} // Default styles
                         onMouseOver={e => {
                           e.currentTarget.style.backgroundColor = 'black';
                           e.currentTarget.style.color = 'white';
                         }}
                         onMouseOut={e => {
                           e.currentTarget.style.backgroundColor = 'white';
                           e.currentTarget.style.color = 'black';
                         }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewJob(matchResult.job_id);
                        }}
                      >
                        View Job
                      </Button>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    {matchResult.matches
                      .slice()
                      .sort((a, b) => b.final_score - a.final_score)
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
                                <div className="w-25 d-flex justify-content-between">
                                <div className="align-self-center flex-grow-1">
                                  <strong>File ID:</strong> {match.file_id}
                                </div>
                                <Button
                                  variant="outline-dark"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewPdf(match.file_id);
                                  }}
                                >
                                  View PDF
                                </Button>
                                </div>
                                <div className="align-self-center ">{match.original_name}</div>
                                <div className="align-self-center">
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
                                        <th>Keyword (Location / Language)</th>
                                        <th>Score</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(match.bm25_scores)
                                        .length > 0 ? (
                                        Object.entries(match.bm25_scores).map(
                                          ([key, value]) => (
                                            <tr key={key}>
                                              <td
                                                style={{
                                                  color:
                                                    value > 0
                                                      ? "green"
                                                      : "inherit",
                                                }}
                                              >
                                                {key}
                                              </td>
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
      <Modal
        size="lg"
        className="mt-4"
        show={jobModalShow}
        onHide={() => setJobModalShow(false)}
      >
        <Modal.Header
          closeButton
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Modal.Title  style={{ width: "100%" }}>
          <div className="d-flex justify-content-center">
            <div
              className="sticky-title text-center text-white"
              style={{
                padding: "5px",
                border: "1px solid #942cd2",
                backgroundColor: "#942cd2",
                borderRadius: "5px",
                width: "100%",
              }}
            >
              Job Details
            </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: "#f8f9fa",
            color: "#000",
            padding: "20px",
            borderRadius: "0 0 5px 5px",
          }}
        >
          {jobDetails && (
            <div>
              <h5 style={{ marginBottom: "10px" }}>
                Job Title: {jobDetails.jobDetails.jobTitle}
              </h5>
              <p style={{ marginBottom: "5px" }}>
                <strong>Company:</strong> {jobDetails.jobDetails.company}
              </p>
              <p style={{ marginBottom: "5px" }}>
                <strong>Location:</strong> {jobDetails.jobDetails.location}
              </p>
              <p style={{ marginBottom: "5px" }}>
                <strong>Employee Type:</strong>{" "}
                {jobDetails.jobDetails.employeeType}
              </p>
              <hr />
              {editor && <EditorContent editor={editor} />}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        size="lg"
        className="mt-4"
        show={pdfModalShow}
        onHide={() => setPdfModalShow(false)}
      >
        <Modal.Header
          closeButton
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Modal.Title style={{width:"100%"}}>
            <div
              className="sticky-title text-center text-white"
              style={{
                padding: "5px",
                border: "1px solid #942cd2",
                backgroundColor: "#942cd2",
                borderRadius: "5px",
                width: "100%",
              }}
            >Resume Information</div>
          </Modal.Title>
        </Modal.Header>
      <Modal.Body>
    <div className="d-flex justify-content-center mb-2">
      <Button
        size="sm"
        className="mx-2"
        variant="primary"
        onClick={() => window.open(pdfFile)}
        style={{ backgroundColor: "rgb(148, 44, 210)", border: "none" }}
      >
        Download PDF
      </Button>
    </div>
    <div className="d-flex justify-content-center mb-2">
    <Button
  className="mx-1"
  variant="outline-alert"
  style={{ 
    backgroundColor: "white", 
    color: "black",
    border: "solid 1px rgb(148, 44, 210)" // Default styles
  }}
  onMouseOver={e => {
    e.currentTarget.style.backgroundColor = 'rgba(130, 38, 158, 0.5)';
    e.currentTarget.style.color = 'white';
  }}
  onMouseOut={e => {
    e.currentTarget.style.backgroundColor = 'white';
    e.currentTarget.style.color = 'black';
  }}
  onClick={previousPage}
  disabled={pageNumber <= 1}
  size="sm"
>
        <ArrowLeftCircleFill style={{color: "rgb(148, 44, 210)"}} size={23} />
      </Button>
      <Button
        variant="outline-alert"
        onClick={nextPage}
        disabled={pageNumber >= numPages}
        size="sm"
        className="mx-1"
        style={{ 
          backgroundColor: "white", 
          color: "black",
          border: "solid 1px rgb(148, 44, 210)" // Default styles
        }}
        onMouseOver={e => {
          e.currentTarget.style.backgroundColor = 'rgba(130, 38, 158, 0.5)';
          e.currentTarget.style.color = 'white';
        }}
        onMouseOut={e => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.color = 'black';
        }}
      >
        <ArrowRightCircleFill style={{color: "rgb(148, 44, 210)"}} size={23} />
      </Button>
    </div>
    <div className="d-flex justify-content-center mb-n5">
      <p className="text-black m-1">
        Page <strong>{pageNumber}</strong> of <strong>{numPages}</strong>
      </p>
    </div>
    <div className="">
      <PDFDocument file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
        <Page width={775}  pageNumber={pageNumber}/>
      </PDFDocument>
    </div>
  </Modal.Body>
      </Modal>
    </div>
  );
}

export default MatchResults;
