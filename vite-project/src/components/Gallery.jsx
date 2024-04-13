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
            <section className='gallery' id='gallerys'>
                <Container>
                    <Row>
                        <Col>
                            <h2>
                                Lorem Ipsum
                            </h2>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis sapiente 
                                deserunt nobis consequatur harum culpa iste iusto sit nesciunt. Quidem est,
                                 placeat inventore exercitationem quis quaerat itaque sed eveniet quibusdam!</p>
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