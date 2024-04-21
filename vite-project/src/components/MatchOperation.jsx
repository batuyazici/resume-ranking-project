import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ArrowRightCircle } from 'react-bootstrap-icons';

const MatchOperation = () => {
  const [showResultButton, setShowResultButton] = useState(false);

  const scores = {
    work: 75, // Example percentage
    education: 60,
    skills: 90,
    language: 85,
    certification: 70 // Added Certification score
  };

  const handleMatchThemClick = () => {
    setShowResultButton(true); // This will show the 'Show Result' button when 'Match Them' is clicked
  };

  return (
    <Container fluid="md" className="top-level-container mt-4">
      <Row className="justify-content-center">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title className='text-center'>Scores Table</Card.Title>
              <Card.Text>
                This displays scores across various categories.
              </Card.Text>
              {/* Adjusted Row to ensure all items fit on the same line */}
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
    <Container fluid="md" className="mt-4b ">
      <Row className="justify-content-center match-container-1 mt-4 mb-4">
        
        <Col md={6}>
          <Card> 
            <Card.Body>
              <Card.Title className='text-center'>Uploaded Resumes</Card.Title>
          
              {/* Multiple Nested Cards */}
              <Card className="mt-3" >
                <Card.Body>
                  <Card.Title>Nested Container 1</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 1.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 2</Card.Title>
                  <Card.Text>
                    Additional nested container inside Container 1.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 3</Card.Title>
                  <Card.Text>
                    Another nested container inside Container 1.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 4</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 4.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 5</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 5.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 6</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 6.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card> 
            <Card.Body>
              <Card.Title className='text-center'>Jobs</Card.Title>
            
              {/* Multiple Nested Cards */}
              <Card className="mt-3 ">
                <Card.Body>
                  <Card.Title>Nested Container 1</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 2.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 2</Card.Title>
                  <Card.Text>
                    Additional nested container inside Container 2.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 3</Card.Title>
                  <Card.Text>
                    Another nested container inside Container 2.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 4</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 4.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 5</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 5.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 6</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 6.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    {!showResultButton && ( // This button will be hidden once it's clicked
        <div className="form-continue-section d-flex justify-content-center">
          <Button variant="outline-dark" className="mt-1 mb-5" size="lg" onClick={handleMatchThemClick}>
            Match Them <ArrowRightCircle size={25} />
          </Button>
        </div>
      )}

      {/* Button to show result */}
      {showResultButton && ( // This button will show up when 'Match Them' is clicked
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
