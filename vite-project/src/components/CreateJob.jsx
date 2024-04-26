import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';
import { X } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

import spectrumGradient from '../assets/img/spectrum-gradient.svg';

const Createjob = () => {
  const [skills, setSkills] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSkillAdd = (event) => {
    event.preventDefault();
    if (inputValue && !skills.includes(inputValue) && skills.length < 10) {
      setSkills(prevSkills => [...prevSkills, inputValue]);
      setInputValue(''); // Clear the input after adding
    }
  };

  const handleRemoveSkill = (index) => {
    setSkills(prevSkills => prevSkills.filter((_, i) => i !== index));
  };

  return (
    <>
      <style type="text/css">
        {`
          .form-control:focus, .form-select:focus {
            box-shadow: 0 0 0 0.25rem rgba(130, 38, 158, 0.5); /* Purple shadow */
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
        }}
      >
        <Form onSubmit={handleSkillAdd} className="border-3 text-dark p-3 bg-white" style={{borderRadius: '15px'}}>
        <div className="text-center">Please make a job description</div>
          <Form.Group className="mb-1" controlId="jobTitle" style={{fontSize:'15px'}}>
            <Form.Label>Job Title</Form.Label>
            <Form.Control  type="text" placeholder="Enter job title" style={{fontSize:'12px'}} />
          </Form.Group>

          <Form.Group className="mb-1" controlId="company" style={{fontSize:'15px'}}>
            <Form.Label>Company</Form.Label>
            <Form.Control type="text" placeholder="Enter company" style={{fontSize:'12px'}}/>
          </Form.Group>

          <Form.Group className="mb-1" controlId="location" style={{fontSize:'15px'}}>
            <Form.Label>Employee Location</Form.Label>
            <Form.Control type="text" placeholder="Enter employee location" style={{fontSize:'12px'}} />
          </Form.Group>

          <Form.Group className="mb-1" controlId="jobDescription">
            <Form.Label>Job Description</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Enter job description" style={{fontSize:'12px'}} />
          </Form.Group>

          <Form.Group className="mb-1" controlId="jobType">
            <Form.Label>Employee Type</Form.Label>
            <Form.Select aria-label="Employee type select" style={{fontSize:'12px'}}>
              <option>Choose one</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="temporary">Temporary</option>
              <option value="internship">Internship</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-1" controlId="jobSkills">
            <Form.Label>Add skills</Form.Label>
            <Form.Text className="mx-1">(Select up to 10)</Form.Text>
            <div className="d-flex flex-wrap">
              {skills.map((skill, index) => (
                <Badge key={index} pill bg="" className="d-flex align-items-center mb-2 ml-0 mt-0 " style={{ borderRadius: '10px', backgroundColor:'#8729cc', marginRight:'4px'}}>
                  {skill}
                  <X style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={() => handleRemoveSkill(index)} />
                </Badge>
              ))}
            </div>
            {skills.length < 10 && (
              <Form.Control
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a skill and press enter"
                className="my-0 "
                onKeyDown={(e) => e.key === 'Enter' && handleSkillAdd(e)}
                style={{fontSize:'12px'}}
              />
            )}
          </Form.Group>

          <div className="form-continue-section d-flex justify-content-center">
            <Button variant="outline-dark" className="mt-1 btn-sm" size="lg">
              Submit
            </Button>
          </div>
        </Form>
      </Container>
    </>
  );
}

export default Createjob;
