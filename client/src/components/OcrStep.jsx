import React, { useState } from "react";
import { Button, Container, Row, Col, Card, Image } from "react-bootstrap";
import PropTypes from "prop-types";
import { ArrowLeftCircle } from "react-bootstrap-icons";
import spectrumGradient from "../assets/img/spectrum-gradient.svg";

import projImg1 from "../assets/img/gallery1.svg";
import projImg2 from "../assets/img/gallery2.svg";
import projImg3 from "../assets/img/gallery3.svg";

function OcrStep({ onStepChange }) {
  const resumes = [
    { name: "Resume 1", imageUrl: projImg1 },
    { name: "Resume 2", imageUrl: projImg2 },
    { name: "Resume 3", imageUrl: projImg3 },
    { name: "Resume 4", imageUrl: projImg1 },
    { name: "Resume 5", imageUrl: projImg2 },
    { name: "Resume 6", imageUrl: projImg3 },
    { name: "Resume 7", imageUrl: projImg1 },
    { name: "Resume 8", imageUrl: projImg2 },
    { name: "Resume 9", imageUrl: projImg3 },
    { name: "Resume 10", imageUrl: projImg1 },
  ];

  const [selectedResumeImage, setSelectedResumeImage] = useState(null);

  return (
    <>
      <div className="d-flex justify-content-center">
        <Button
          variant="outline-dark"
          className="mt-3"
          size="sm"
          onClick={() => onStepChange("detect")}
          style={{ fontSize: "15px" }}
        >
          Return to Detection <ArrowLeftCircle size={20} />
        </Button>
      </div>
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
        <Row>
          <Col md={6}>
            <Container
              className="text-dark"
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                padding: "20px",
                maxHeight: "600px", // Common height
                overflowY: "auto", // Scrollable
              }}
            >
              <h4 className="text-center text-uppercase font-weight-normal">Resumes</h4>
              {resumes.map((resume, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Card.Title>{resume.name}</Card.Title>
                    <Card.Text>
                      Some brief details about {resume.name.toLowerCase()} could go here.
                    </Card.Text>
                    <Button
                      variant="primary"
                      style={{ backgroundColor: "#942cd2", border: "#942cd2" }}
                      size="sm"
                      onClick={() => setSelectedResumeImage(resume.imageUrl)}
                    >
                      Details
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </Container>
          </Col>
          <Col md={6}>
            <Container
              className="text-dark"
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                padding: "20px",
                maxHeight: "600px", // Common height
                overflow: "hidden", // Prevents any accidental overflow
              }}
            >
              <h4 className="text-center text-uppercase font-weight-normal">OCR Result</h4>
              {selectedResumeImage ? (
                <Image
                  src={selectedResumeImage}
                  alt="Resume"
                  style={{ width: "100%" }}
                />
              ) : (
                <p>Click on a Details button to view a resume.</p>
              )}
            </Container>
          </Col>
        </Row>
      </Container>
    </>
  );
}

OcrStep.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default OcrStep;
