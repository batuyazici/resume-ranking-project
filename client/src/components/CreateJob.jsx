import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { X, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import Tiptap from "./Tiptap";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Badge,
  Alert,
} from "react-bootstrap";
import spectrumGradient from "../assets/img/spectrum-gradient.svg";

const CreateJob = () => {
  const [skills, setSkills] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [buttonText, setButtonText] = useState("Submit"); // Button text state
  const [showSuccess, setShowSuccess] = useState(false); // Success alert state
  const navigate = useNavigate(); // Initialize useNavigate

  const [scores, setScores] = useState({
    skills: 0,
    experience: 0,
    education: 0,
    miscellaneous: 0,
    necessities: 0,
  });
  const [jobDetails, setJobDetails] = useState({
    jobTitle: "",
    company: "",
    location: "",
    employeeType: "",
  });
  const tiptapEditorRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const jobDescriptionJSON = tiptapEditorRef.current
      ? tiptapEditorRef.current.getJSON()
      : {};

    // Function to extract text content from the JSON
    const extractText = (nodes) => {
      let textContent = "";
      nodes.forEach((node) => {
        if (node.content) {
          textContent += extractText(node.content);
        }
        if (node.text) {
          textContent += node.text + " ";
        }
      });
      return textContent;
    };

    const textOutput = extractText(jobDescriptionJSON.content || []).trim();

    const submissionData = {
      scores: scores,
      jobDetails: jobDetails,
      Skills: skills,
      JobDesc: textOutput,
      JobDescJSON: jobDescriptionJSON, // Include the full JSON structure for HTML operations
    };

    try {
      const response = await fetch(import.meta.env.VITE_FAST_API_EMBEDJ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");

      }

      const result = await response.json();
      console.log("Success:", result);
      console.log(result);
-      setShowSuccess(true); // Show success alert
      // Clear the form data after submission
      setScores({
        skills: 0,
        experience: 0,
        education: 0,
        miscellaneous: 0,
        necessities: 0,
      });
      setJobDetails({
        jobTitle: "",
        company: "",
        location: "",
        employeeType: "",
      });
      setSkills([]);
      setInputValue("");
      tiptapEditorRef.current.clearContent();
    } catch (error) {
      console.error("Error:", error);
    }

    // Pretty print JSON with indentation
    console.log("Submission Data:", JSON.stringify(submissionData, null, 2));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setJobDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleIncrement = (key) => {
    const totalScore = Object.values(scores).reduce(
      (total, score) => total + score,
      0
    );
    if (scores[key] < 100 && totalScore < 100) {
      const increment = Math.min(5, 100 - scores[key], 100 - totalScore);
      setScores((prevScores) => ({
        ...prevScores,
        [key]: prevScores[key] + increment,
      }));
    }
  };

  const handleDecrement = (key) => {
    setScores((prevScores) => ({
      ...prevScores,
      [key]: Math.max(prevScores[key] - 5, 0),
    }));
  };

  const handleSkillAdd = (event) => {
    event.preventDefault();
    if (inputValue && !skills.includes(inputValue) && skills.length < 10) {
      setSkills((prevSkills) => [...prevSkills, inputValue]);
      setInputValue("");
    }
  };

  const handleRemoveSkill = (index) => {
    setSkills((prevSkills) => prevSkills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission on Enter key press
    }
  };

  const handleMatchClick = () => {
    navigate("/match");
  };

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

      <Container
        fluid="md"
        className="mt-4 mb-4"
        style={{
          backgroundImage: `url(${spectrumGradient})`,
          backgroundPosition: "top center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          borderRadius: "30px",
          padding: "20px",
        }}
      >
        {showSuccess && (
          <Alert
            variant="success"
            onClose={() => setShowSuccess(false)}
            dismissible
          >
            Job posted successfully!
          </Alert>
        )}
        <Form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown} // Prevent form submission on Enter key press
          className="border-3 text-dark p-3 bg-white"
          style={{ borderRadius: "15px" }}
        >
          <div className="text-center mb-3">
            Fill in the job details and set CV category weights to equal 100%.
          </div>
          <Row className="justify-content-center">
            <Col>
              <div className="p-0 border-0 mb-4 mt-2">
                <Row xs={1} sm={2} md={6} lg={5} className="g-3">
                  {Object.keys(scores).map((key) => (
                    <Col key={key}>
                      <div>
                        <h5
                          className="text-center mb-3"
                          style={{ fontSize: "13px", color: "black" }}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h5>
                        <div
                          className="circle-container"
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="link"
                            onClick={() => handleDecrement(key)}
                            style={{ zIndex: 1 }}
                          >
                            <ChevronLeft color="black" size={20} />
                          </Button>
                          <div
                            className="circle"
                            style={{
                              "--percentage": `${scores[key] * 3.6}deg`,
                            }}
                          >
                            <span>{scores[key]}%</span>
                          </div>
                          <Button
                            variant="link"
                            onClick={() => handleIncrement(key)}
                            style={{ zIndex: 1 }}
                          >
                            <ChevronRight color="black" size={20} />
                          </Button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          </Row>
          <Form.Group className="mb-1" controlId="jobTitle">
            <Form.Label>Job Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter job title"
              name="jobTitle"
              value={jobDetails.jobTitle}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-1" controlId="company">
            <Form.Label>Company</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter company name"
              name="company"
              value={jobDetails.company}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-1" controlId="location">
            <Form.Label>Job Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter location"
              name="location"
              value={jobDetails.location}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-1" controlId="jobType">
            <Form.Label>Job Type</Form.Label>
            <Form.Select
              aria-label="Employee type select"
              name="employeeType"
              value={jobDetails.employeeType}
              onChange={handleInputChange}
            >
              <option value="">Choose one</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
              <option value="temporary">Temporary</option>
              <option value="internship">Internship</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-1" controlId="jobDescription">
            <Form.Label>Job Description</Form.Label>
            <Tiptap ref={tiptapEditorRef} />
          </Form.Group>
          <Form.Group className="mb-1 mt-0" controlId="jobSkills">
            <Form.Label>Add Skills</Form.Label>
            <Form.Text className="mx-1">(Select up to 10)</Form.Text>
            <div className="d-flex flex-wrap">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  bg=""
                  className="d-flex align-items-center mb-2 ml-0 mt-0 "
                  style={{
                    borderRadius: "10px",
                    backgroundColor: "#8729cc",
                    marginRight: "4px",
                  }}
                >
                  {skill}
                  <X
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                    onClick={() => handleRemoveSkill(index)}
                  />
                </Badge>
              ))}
              {skills.length < 10 && (
                <Form.Control
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a skill and press enter"
                  onKeyDown={(e) => e.key === "Enter" && handleSkillAdd(e)}
                />
              )}
            </div>
          </Form.Group>
          <div className="form-continue-section d-flex justify-content-center">
            <Button
              type="submit"
              variant="outline-dark"
              className="mt-1 btn-sm"
              size="lg"
            >
              {buttonText}
            </Button>
          </div>
        </Form>
      </Container>
      {showSuccess && (
        <div className="d-flex justify-content-center mt-1">
          <Button
            type="submit"
            variant="outline-dark"
            className="btn-sm"
            size="lg"
            onClick={handleMatchClick}
          >
            Match CVs
          </Button>
        </div>
      )}
    </>
  );
};

export default CreateJob;
