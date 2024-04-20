import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import logo from "/src/assets/img/logo11.svg";
import navIcon1 from "../assets/img/nav-icon1.svg";
import navIcon2 from "../assets/img/nav-icon2.svg";
import navIcon3 from "../assets/img/nav-icon3.svg";

export const Footer = () => {
    return (
        <footer className="footer">
            <Container>
                <Row className="align-items-center">
                    <Col size={12} sm={6}>
                         <p>Copyright 2024. All Rights Reserved</p>
                        <p>Damla Sabaz & Mehmet Batuhan Yazıcı</p>
                    </Col>
                    <Col size={12} sm={6} className="text-center text-sm-end">
                        <div className="social-icon">
                            <a href="https://www.linkedin.com/in/mbatuhanyazici/"><img src={navIcon1} alt="Icon" /></a>
                            <a href="https://github.com/batuyazici/resume-ranking-project"><img src={navIcon3} alt="Icon" /></a>
                            <a href="https://www.linkedin.com/in/damlasabaz/"><img src={navIcon2} alt="Icon" /></a>
                            
                        </div>
                        
                       
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;
