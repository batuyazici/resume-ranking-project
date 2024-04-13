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
                        <div className="present-bx">
                            <h2>
                                Lorem Ipsum
                            </h2>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias laborum error ullam possimus, eos vero corporis?
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias laborum error ullam possimus, eos vero corporis?
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias laborum error ullam possimus, eos vero corporis</p>
                            <Carousel responsive={responsive} infinite={true} className="Presentation-slider">
                                <div className="item">
                                    <img src={resume1} alt="Image" />
                                    <h5>Lorem Ipsum</h5>
                                </div>
                                <div className="item">
                                    <img src={resume3} alt="Image" />
                                    <h5>Lorem Ipsum</h5>
                                </div>
                                <div className="item">
                                    <img src={resume4} alt="Image" />
                                    <h5>Lorem Ipsum</h5>
                                </div>
                                <div className="item">
                                    <img src={resume5} alt="Image" />
                                    <h5>Lorem Ipsum</h5>
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