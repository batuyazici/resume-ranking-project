import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom"; // Import Link
import logo from "/src/assets/img/logo11.svg";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { useState, useEffect } from "react";

function HeaderNavbar() {
  const navigate = useNavigate();
  const [activeLink, SetActiveLink] = useState("home");
  const [scrolled, seScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        seScrolled(true);
      } else {
        seScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onUpdateActiveLink = (value) => {
    SetActiveLink(value);
  };

  return (
    <Navbar expand="lg" className={scrolled ? "scrolled" : ""}>
      <Container>
        <Navbar.Brand>
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/cvs"
              className={
                activeLink === "cvs" ? "active navbar-link" : "navbar-link"
              }
              onClick={() => onUpdateActiveLink("cvs")}
            >
              Add CVs
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/jobs"
              className={
                activeLink === "jobs" ? "active navbar-link" : "navbar-link"
              }
              onClick={() => onUpdateActiveLink("jobs")}
            >
              Create a Job
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/results/match"
              className={
                activeLink === "/results/match"
                  ? "active navbar-link"
                  : "navbar-link"
              }
              onClick={() => onUpdateActiveLink("results/match")}
            >
              Match Results
            </Nav.Link>
            {/* <Nav.Link
              as={Link}
              to="/results/cvs"
              className={
                activeLink === "/results/cvs" ? "active navbar-link" : "navbar-link"
              }
              onClick={() => onUpdateActiveLink("results/cv")}
            >
              CV Results
            </Nav.Link> */}
          </Nav>
          <span className="navbar-text">
            <button className="vvd" onClick={() => navigate("/match")}>
              <span>Match CVs</span>
            </button>
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default HeaderNavbar;
