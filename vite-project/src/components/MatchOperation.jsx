import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ArrowRightCircle } from 'react-bootstrap-icons';

const MatchOperation = () => {
  const [showResultButton, setShowResultButton] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);

  const scores = {
    work: 75,
    education: 60,
    skills: 90,
    language: 85,
    certification: 70
  };

  const handleMatchThemClick = () => {
    setShowResultButton(true);
    // Example action: Log the selected containers to the console
    console.log("Selected Containers:", selectedContainers);
  };

  const handleContainerClick = (containerId) => {
    setSelectedContainers(prev => {
      if (prev.includes(containerId)) {
        return prev.filter(id => id !== containerId);
      } else {
        return [...prev, containerId];
      }
    });
  };

  const containerStyle = (containerId) => ({
    backgroundColor: selectedContainers.includes(containerId) ? '#f0f0f0' : '',
    cursor: 'pointer'
  });

  const isSelectedText = (containerId) => {
    return selectedContainers.includes(containerId) ? "Selected" : "";
  };

  return (
    <Container fluid="md" className="top-level-container mt-4">
      <Row className="justify-content-center">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title className='text-center'>Scores Table</Card.Title>
              <Card.Text>This displays scores across various categories.</Card.Text>
              <Row xs={1} sm={2} md={5} lg={5} className="g-3">
                {Object.entries(scores).map(([key, value]) => (
                  <Col key={key}>
                    <Card>
                      <Card.Body>
                        <Card.Title className='text-center'>{key.charAt(0).toUpperCase() + key.slice(1)}</Card.Title>
                        <div className="circle-container">
                          <div className="circle" style={{ '--percentage': `${value * 3.6}deg` }}>
                            <span>{value}%</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Container fluid="md" className="mt-4b">
        <Row className="justify-content-center match-container-1 mt-4 mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title className='text-center'>Uploaded Resumes</Card.Title>
                {[...Array(6)].map((_, index) => (
                  <Card className="mt-3" key={`resume-${index}`} style={containerStyle(`resume-${index}`)} onClick={() => handleContainerClick(`resume-${index}`)}>
                    <Card.Body>
                      <Card.Title>Nested Container {index + 1}</Card.Title>
                      <Card.Text>
                        {isSelectedText(`resume-${index}`)}{/* Displaying selection status */}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title className='text-center'>Jobs</Card.Title>
                {[...Array(6)].map((_, index) => (
                  <Card className="mt-3" key={`job-${index}`} style={containerStyle(`job-${index}`)} onClick={() => handleContainerClick(`job-${index}`)}>
                    <Card.Body>
                      <Card.Title>Nested Container {index + 1}</Card.Title>
                      <Card.Text>
                        {isSelectedText(`job-${index}`)}{/* Displaying selection status */}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {!showResultButton && (
        <div className="form-continue-section d-flex justify-content-center">
          <Button variant="outline-dark" className="mt-1 mb-5" size="lg" onClick={handleMatchThemClick}>
            Match Them <ArrowRightCircle size={25} />
          </Button>
        </div>
      )}

      {showResultButton && (
        <div className="form-continue-section d-flex justify-content-center">
          <Button variant="outline-dark" className="mt-1 mb-5" size="lg">
            Show Result <ArrowRightCircle size={25} />
          </Button>
        </div>
      )}
    </Container>
  );
}

export default MatchOperation;
