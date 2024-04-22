import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ArrowRightCircle, CheckCircleFill, ChevronLeft, ChevronRight } from 'react-bootstrap-icons'; 

const MatchOperation = () => {
  const [showResultButton, setShowResultButton] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);
  const [scores, setScores] = useState({
    work: 0,
    education: 0,
    skills: 0,
    language: 0,
    certification: 0
  });

  const handleMatchThemClick = () => {
    setShowResultButton(true);
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
    backgroundColor: selectedContainers.includes(containerId) ? '#e1d2ec' : '',
    cursor: 'pointer',
    position: 'relative',
  });

  const checkMark = (containerId) => {
    return selectedContainers.includes(containerId) ? <CheckCircleFill color="purple" 
    size={20} style={{ position: 'absolute', top: '5px', right: '5px' }} /> : null;
  };

  const handleIncrement = (key) => {
    setScores(prev => ({
      ...prev,
      [key]: Math.min(prev[key] + 5, 100)  // Prevent going over 100%
    }));
  };

  const handleDecrement = (key) => {
    setScores(prev => ({
      ...prev,
      [key]: Math.max(prev[key] - 5, 0)  // Prevent dropping below 0%
    }));
  };


  return (
    <Container fluid="md" className="mt-4"> {/* Increased top margin */}
    <Row className="justify-content-center">
      <Col>
        <div className="p-3 border-0">
          <Row xs={1} sm={2} md={6} lg={5} className="g-3">
            {Object.keys(scores).map(key => (
              <Col key={key}>
                <div>
                  <h5 className='text-center mb-3' style={{ fontSize: '15px', color: 'black' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</h5>
                  <div className="circle-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Button variant="link" onClick={() => handleDecrement(key)} style={{ zIndex: 1 }}><ChevronLeft color="black" size={20}/></Button>
                    <div className="circle" style={{ '--percentage': `${scores[key] * 3.6}deg` }}>
                      <span>{scores[key]}%</span>
                    </div>
                    <Button variant="link" onClick={() => handleIncrement(key)} style={{ zIndex: 1 }}><ChevronRight color="black" size={20}/></Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Col>
    </Row>

      <Container fluid="md" className="mt-4b">
        <Row className="justify-content-center match-container-1 mt-4 mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title className='text-center' style={{fontSize:'17px'}}>Uploaded Resumes</Card.Title>
                {[...Array(6)].map((_, index) => (
                  <Card className="mt-3" key={`resume-${index}`} style={containerStyle(`resume-${index}`)} onClick={() => handleContainerClick(`resume-${index}`)}>
                    <Card.Body>
                      <Card.Title style={{fontSize:'15px'}}>Nested Container {index + 1}</Card.Title>
                      <Card.Text>
                        {checkMark(`resume-${index}`)} {/* Displaying selection status with icon */}
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
                <Card.Title className='text-center' style={{fontSize:'17px'}}>Jobs</Card.Title>
                {[...Array(6)].map((_, index) => (
                  <Card className="mt-3" key={`job-${index}`} style={containerStyle(`job-${index}`)} onClick={() => handleContainerClick(`job-${index}`)}>
                    <Card.Body>
                      <Card.Title style={{fontSize:'15px'}}>Nested Container {index + 1}</Card.Title>
                      <Card.Text>
                        {checkMark(`job-${index}`)} {/* Displaying selection status with icon */}
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
          <Button variant="outline-dark" className="mt-1 mb-5 btn-sm" size="lg" onClick={handleMatchThemClick}>
            Match Them <ArrowRightCircle size={25} />
          </Button>
        </div>
      )}

      {showResultButton && (
        <div className="form-continue-section d-flex justify-content-center">
          <Button variant="outline-dark " className="mt-1 mb-5 btn-sm" size="lg">
            Show Result <ArrowRightCircle size={25} />
          </Button>
        </div>
      )}
    </Container>
  );
}

export default MatchOperation;
