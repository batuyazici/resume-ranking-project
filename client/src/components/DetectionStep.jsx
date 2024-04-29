import React, { useState } from 'react';
import { Modal, Button, Image, Container, Row, Col } from 'react-bootstrap';
import projImg1 from "../assets/img/gallery1.svg";
import projImg2 from "../assets/img/gallery2.svg";
import projImg3 from "../assets/img/2b6427d5-510d-44ed-9ae3-3e00ffc95bd8_page-2-.jpg";
import spectrumGradient from '../assets/img/spectrum-gradient.svg'; // Ensure this path is correct

function DetectionStep() {
  const [show, setShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [contactInfo, setContactInfo] = useState({name: '', surname: '', email: '', phone: ''});

  const handleClose = () => setShow(false);
  const handleShow = (image) => {
    setSelectedImage(image);
    setShow(true);
    // Update contact info based on the image or as needed
    const info = {
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890'
    };
    setContactInfo(info);
  };

  const images = [
    projImg1, projImg2, projImg3, projImg1, projImg2, projImg3,
    projImg1, projImg2, projImg3, projImg1, projImg2, projImg3,
    projImg1, projImg2, projImg3, projImg1, projImg2, projImg3,
    projImg1, projImg2, projImg3, projImg1, projImg2, projImg3,
  ];

  return (
    <>
      <style>
        {`
          .white-background::-webkit-scrollbar {
            width: 8px;
          }

          .white-background::-webkit-scrollbar-track {
            background: transparent;
            margin-bottom: 10px;
            margin-top: 10px;
            width: 50%;
          }

          .white-background::-webkit-scrollbar-thumb {
            background: purple;
            border-radius: 10px;
            margin-right: 20px;
          }

          .white-background::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          .contact-text {
            color: black; /* Set text color to black */
          }
        `}
      </style>
      <Container className="mt-5 mb-5"
        style={{
          backgroundImage: `url(${spectrumGradient})`,
          backgroundPosition: 'top center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          borderRadius: '30px',
          padding: '20px',
        }}
      >
        <Container className="white-background" style={{ 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          maxHeight: '500px', 
          padding: '0 20px 20px 20px'
        }}> 
          <Row>
            {images.map((image, index) => (
              <Col key={index} xs={6} md={4} lg={3} className="mb-2 mt-2">
                <Image
                  src={image}
                  thumbnail
                  onClick={() => handleShow(image)}
                  style={{ cursor: 'pointer', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                />
              </Col>
            ))}
          </Row>
        </Container>

        <Modal show={show} onHide={handleClose} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Image Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Image src={selectedImage} fluid />
        
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose} style={{ background: 'purple' }}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default DetectionStep;
