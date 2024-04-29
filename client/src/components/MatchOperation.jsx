import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ArrowRightCircle, CheckCircleFill, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

const MatchOperation = () => {
  const [showResultButton, setShowResultButton] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);
  
  

  const handleMatchThemClick = () => {
    setShowResultButton(true);
    console.log("Selected Containers:", selectedContainers);
  };

  const handleContainerClick = (containerId) => {
    setSelectedContainers(prev => {
     
      const containerType = containerId.includes('resume') ? 'resume' : 'job';

      if (containerType === 'job') {
       
        if (prev.includes(containerId)) {
        
          return prev.filter(id => !id.includes('job'));
        } else {
          
          const nonJobContainers = prev.filter(id => !id.includes('job'));
          return [...nonJobContainers, containerId];
        }
      } else {
      
        const filteredContainers = prev.filter(id => !id.includes(containerId));
        if (prev.includes(containerId)) {
         
          return filteredContainers;
        } else {
       
          return [...filteredContainers, containerId];
        }
      }
    });
};


  const containerStyle = (containerId) => ({
    backgroundColor: selectedContainers.includes(containerId) ? '#e1d2ec' : '',
    cursor: 'pointer',
    position: 'relative',
  });

  const checkMark = (containerId) => {
    return selectedContainers.includes(containerId) ? <CheckCircleFill color="purple" size={20} style={{ position: 'absolute', top: '5px', right: '5px' }} /> : null;
  };



  return (
   

      <Container fluid="md" className="mt-4b">
        <Row className="justify-content-center match-container-1 mt-4 mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title className='text-center' style={{fontSize:'16px'}}>Uploaded Resumes</Card.Title>
                {[...Array(6)].map((_, index) => (
                  <Card className="mt-3" key={`resume-${index}`} style={containerStyle(`resume-${index}`)} onClick={() => handleContainerClick(`resume-${index}`)}>
                    <Card.Body>
                    <Card.Title style={{fontSize:'13px'}}>Date: {index + 1}</Card.Title>
                      <Card.Title style={{fontSize:'13px'}}>Uploaded Resumes: {index + 1}</Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        {checkMark(`resume-${index}`)}
                        
                      
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title className='text-center' style={{fontSize:'16px'}}>Jobs</Card.Title>
                {[...Array(6)].map((_, index) => (
                  <Card className="mt-3" key={`job-${index}`} style={containerStyle(`job-${index}`)} onClick={() => handleContainerClick(`job-${index}`)}>
                    <Card.Body>
                    <Card.Title style={{fontSize:'13px'}}>Date: {index + 1}</Card.Title>
                      <Card.Title style={{fontSize:'13px'}}>Job Title: {index + 1}</Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        {checkMark(`job-${index}`)}
                       
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
  
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
