import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';


import GalleryCard from '../components/GalleryCard'
import 'animate.css';

import projImg1 from "../assets/img/gallery1.svg";
import projImg2 from "../assets/img/gallery2.svg";
import projImg3 from "../assets/img/gallery3.svg";


export const Gallery = () => {

    const gallery = [
        {
            title: "Lorem Ipsum",
            description: "Lorem Ipsum",
            imgUrl: projImg1,
          },
          {
            title: "Lorem Ipsum",
            description: "Lorem Ipsum",
            imgUrl: projImg2,
          },
          {
            title: "Lorem Ipsum",
            description: "Lorem Ipsum",
            imgUrl: projImg3,
          },
         
    ];

    return (
            <section className='gallery content-container' id='gallerys'>
                <Container>
                    <Row>
                        <Col>
                            <h2>
                            For Employers
                            </h2>
                            <p>Create your job posting and quickly find ideal candidates from our CV database. Our technology automatically matches candidates' skills and experience to your job requirements, 
                                so you can easily track and assess the process with our candidate management tools.</p>
                             <Tab.Container id='gallery-tabs' defaultActiveKey='first'>
                             
                                <Tab.Content>
                                    <Tab.Pane eventKey='first'>
                                        <Row>
                                            {
                                                gallery.map((item, index) => (
                                                    <GalleryCard key={index}  imgUrl={item.imgUrl} />
                                                ))
                                            }
                                        </Row>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='second'>
                                    <Row>
                                            {
                                                gallery.map((item, index) => (
                                                    <GalleryCard key={index}  imgUrl={item.imgUrl} />
                                                ))
                                            }
                                        </Row>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='third'>
                                    <Row>
                                            {
                                                gallery.map((item, index) => (
                                                    <GalleryCard key={index}  imgUrl={item.imgUrl} />
                                                ))
                                            }
                                        </Row>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </Col>
                    </Row>
                </Container>
                
            </section>

    )

}


export default Gallery;