import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import resume1 from '../assets/img/resume3.svg'
import resume3 from '../assets/img/resume1.svg'
import resume4 from '../assets/img/resume4.svg' 
import resume5 from '../assets/img/resume5.svg' 


export const Presentation = () => {

    const responsive = {
        superLargeDesktop: {
          // the naming can be any, depends on you.
          breakpoint: { max: 4000, min: 3000 },
          items: 5
        },
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1
        }
      };

      return (
        <section className="Presentation" id="Presentation">
            <Container>
                <Row>
                    <Col>
                        <div className="present-bx p-5 mx-5">
                            <h2>
                            For Job Seekers
                            </h2>
                            <Col className="mx-5">
                            <p>Upload your CV, highlight your skills and experience! Our system automatically matches you with job postings that match your profile and expectations.
                                 Discover positions that match your career goals and apply now.
                                 Take advantage of our career tips and resume editing tools to guide you through your job search.</p>
                            </Col>
                           
                            <Carousel responsive={responsive} infinite={true} className="Presentation-slider">
                                <div className="item">
                                    <img src={resume1} alt="Image" />
                                    <h5>Find a suitable job</h5>
                                </div>
                                <div className="item">
                                    <img src={resume3} alt="Image" />
                                    <h5>Prepare a CV</h5>
                                </div>
                                <div className="item">
                                    <img src={resume4} alt="Image" />
                                    <h5>Upload CV</h5>
                                </div>
                                <div className="item">
                                    <img src={resume5} alt="Image" />
                                    <h5>Explore current job openings</h5>
                                </div>
                                
                            </Carousel>
                        </div>
                    </Col>
                </Row>
            </Container>
           
        </section>
      )
}

export default Presentation;