import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from "react-router-dom"; // Import Link
import logo from '/src/assets/img/logo11.svg';

import navIcon1 from '../assets/img/nav-icon1.svg';
import navIcon2 from '../assets/img/nav-icon2.svg';
import navIcon3 from '../assets/img/nav-icon3.svg';

import { useState, useEffect } from 'react';

function BasicExample() {
  const [activeLink, SetActiveLink] = useState('home');
  const [scrolled, seScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        seScrolled(true);
      } else {
        seScrolled(false);
      }
    }

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [])

  const onUpdateActiveLink = (value) => {
    SetActiveLink(value);
  }

  return (
    <Navbar expand="lg" className={scrolled ? "scrolled" : ""}>
      <Container>
        <Navbar.Brand>
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <span className='navbar-toggler-icon'></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/cvs" className={activeLink === 'cvs' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('cvs')}>Add CVs</Nav.Link>
            <Nav.Link as={Link} to="/jobs" className={activeLink === 'jobs' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('jobs')}>Create a Job</Nav.Link>  
          </Nav>
          <span className='navbar-text'>
         
            <button className='vvd' onClick={() => console.log('matchcvs')}><span>Match CVs</span></button>
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;
